import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/data";
import { getApprovedReviewsForProduct } from "@/lib/account-data";
import {
  getProductGallery,
  getProductHighlights,
  getProductCategory,
} from "@/lib/product-utils";
import { Info } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ProductBreadcrumbs } from "@/components/store/ProductBreadcrumbs";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductRating } from "@/components/store/ProductRating";
import { ProductActions } from "@/components/store/ProductActions";
import { ProductShippingInfo } from "@/components/store/ProductShippingInfo";
import { ProductReviewsSection } from "@/components/store/ProductReviewsSection";
import { ProductDescription } from "@/components/store/ProductDescription";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const reviews = await getApprovedReviewsForProduct(product.id);

  const category = getProductCategory(product);
  const gallery = getProductGallery(product);
  const highlights = getProductHighlights(product);
  const savings =
    product.compare_at_price && product.compare_at_price > product.price
      ? product.compare_at_price - product.price
      : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      <ProductBreadcrumbs
        product={product}
        categoryName={category?.name}
        categorySlug={category?.slug}
      />

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <ProductGallery images={gallery} productName={product.name} />

        <div className="lg:pt-2">
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 leading-tight tracking-tight">
            {product.name}
          </h1>

          <div className="mt-2">
            <ProductRating product={product} />
          </div>

          <div className="mt-5">
            <p className="text-2xl font-bold text-slate-900">
              {formatPrice(product.price)}
            </p>
            {savings !== null && (
              <p className="text-sm font-medium text-red-600 mt-0.5">
                Save{" "}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(savings)}
              </p>
            )}
            {product.compare_at_price && (
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                Comp. Value: {formatPrice(product.compare_at_price)}
                <Info className="w-3.5 h-3.5" aria-hidden="true" />
              </p>
            )}
          </div>

          <div className="mt-7">
            <h2 className="text-[15px] font-bold text-slate-900 mb-2.5">
              About Product
            </h2>
            <ul className="space-y-1.5">
              {highlights.map((item) => (
                <li key={item} className="text-sm text-slate-700 pl-1">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-7">
            <ProductActions product={product} />
          </div>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-slate-100 grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            Product Description
          </h2>
          <ProductDescription description={product.description} />
        </section>

        <ProductShippingInfo />
      </div>

      <ProductReviewsSection product={product} reviews={reviews} />
    </div>
  );
}
