"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Tag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { cartLineKey } from "@/lib/product-variant-utils";
import { formatPrice } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [freeShipping, setFreeShipping] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<
    { id: string; label: string; description: string }[]
  >([]);
  const [paymentMethod, setPaymentMethod] = useState("stripe");

  const cartItems = items.map((item) => ({
    productId: item.product.id,
    variantId: item.variantId ?? null,
    name: item.variantLabel
      ? `${item.product.name} (${item.variantLabel})`
      : item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    image: item.product.image_url,
  }));

  const subtotal = getTotal();

  useEffect(() => {
    fetch("/api/store/payment-methods")
      .then((res) => res.json())
      .then((data) => {
        const methods = Array.isArray(data.methods) ? data.methods : [];
        setPaymentMethods(methods);
        if (methods[0]?.id) setPaymentMethod(methods[0].id);
      })
      .catch(() => setPaymentMethods([]));
  }, []);

  useEffect(() => {
    if (!items.length) return;

    fetch("/api/cart/totals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartItems.map((i) => ({
          productId: i.productId,
          price: i.price,
          quantity: i.quantity,
        })),
        discount,
        freeShipping,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setShipping(data.shipping ?? 0);
        setTax(data.tax ?? 0);
        setOrderTotal(data.total ?? subtotal);
      })
      .catch(() => {
        setShipping(0);
        setTax(0);
        setOrderTotal(subtotal - discount);
      });
  }, [items, discount, freeShipping, subtotal]);

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), items: cartItems }),
      });
      const data = await res.json();
      if (!data.valid) {
        setCouponError(data.error ?? "Invalid coupon");
        setAppliedCoupon(null);
        setDiscount(0);
        setShipping(0);
        return;
      }
      setAppliedCoupon(data.code);
      setDiscount(data.discount);
      setShipping(data.shipping);
      setTax(data.tax ?? 0);
      setOrderTotal(data.total);
      setFreeShipping(data.freeShipping);
    } catch {
      setCouponError("Could not validate coupon.");
    } finally {
      setApplyingCoupon(false);
    }
  }

  function clearCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setDiscount(0);
    setShipping(0);
    setTax(0);
    setOrderTotal(subtotal);
    setFreeShipping(false);
    setCouponError(null);
  }

  async function handleCheckout() {
    setLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          couponCode: appliedCoupon ?? undefined,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setCheckoutError(
        data.error ?? "Checkout failed. Please try again or contact support."
      );
    } catch {
      setCheckoutError(
        "Checkout failed. Please configure Stripe keys or try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Your cart is empty
        </h1>
        <p className="text-slate-500 mb-8">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">
        Shopping Cart ({items.length})
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const lineKey = cartLineKey(item.product.id, item.variantId);
            return (
            <div
              key={lineKey}
              className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-2xl border border-slate-200"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                {item.product.image_url && (
                  <div className="flex h-full w-full items-center justify-center p-2">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="font-semibold text-slate-900 hover:text-primary"
                >
                  {item.product.name}
                  {item.variantLabel ? (
                    <span className="text-slate-500 font-normal">
                      {" "}
                      — {item.variantLabel}
                    </span>
                  ) : null}
                </Link>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {formatPrice(item.product.price)}
                </p>

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-slate-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(lineKey, item.quantity - 1)
                      }
                      className="min-w-[44px] min-h-[44px] p-2 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                      aria-label={`Decrease quantity of ${item.product.name}`}
                    >
                      <Minus className="w-3 h-3" aria-hidden="true" />
                    </button>
                    <span className="px-3 text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(lineKey, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.product.stock}
                      className="min-w-[44px] min-h-[44px] p-2 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                      aria-label={`Increase quantity of ${item.product.name}`}
                    >
                      <Plus className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(lineKey)}
                    className="min-w-[44px] min-h-[44px] p-2 text-red-500 hover:bg-red-50 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    aria-label={`Remove ${item.product.name} from cart`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <p className="font-bold text-slate-900 sm:text-right sm:self-center">
                {formatPrice(item.product.price * item.quantity)}
              </p>
            </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Order Summary
          </h2>

          <div className="mb-4">
            <label
              htmlFor="coupon-code"
              className="text-sm font-medium text-slate-700 flex items-center gap-1 mb-2"
            >
              <Tag className="w-4 h-4" aria-hidden="true" />
              Coupon code
            </label>
            <div className="flex gap-2">
              <input
                id="coupon-code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={!!appliedCoupon}
                placeholder="SAVE10"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm uppercase disabled:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={clearCoupon}
                  className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                  className="px-3 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  Apply
                </button>
              )}
            </div>
            {couponError && (
              <p className="text-xs text-red-600 mt-1" role="alert">
                {couponError}
              </p>
            )}
            {appliedCoupon && (
              <p className="text-xs text-green-600 mt-1" role="status">
                Coupon {appliedCoupon} applied
              </p>
            )}
          </div>

          {paymentMethods.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-medium text-slate-700 mb-2">
                Payment method
              </p>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === method.id
                        ? "border-primary bg-primary-light/40"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-medium text-slate-900">
                        {method.label}
                      </span>
                      <span className="block text-xs text-slate-500 mt-0.5">
                        {method.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Shipping</span>
              <span
                className={`font-medium ${
                  shipping === 0 ? "text-green-600" : ""
                }`}
              >
                {shipping === 0
                  ? freeShipping
                    ? "Free (coupon)"
                    : "Free"
                  : formatPrice(shipping)}
              </span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated tax</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-3 flex justify-between">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-bold text-xl text-slate-900">
                {formatPrice(orderTotal)}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || paymentMethods.length === 0}
            className="w-full mt-6 bg-primary text-white py-4 rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : paymentMethod === "cod"
                ? "Place order (pay on delivery)"
                : "Proceed to Checkout"}
          </button>

          {checkoutError && (
            <p className="mt-4 text-sm text-red-600 text-center">{checkoutError}</p>
          )}

          <p className="text-xs text-slate-400 text-center mt-3">
            Secure checkout powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
