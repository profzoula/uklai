import Link from "next/link";
import { Heart } from "lucide-react";
import { getUserWishlistProducts } from "@/lib/account-data";
import { getUser } from "@/lib/supabase/server";
import { AccountMainPanel } from "@/components/store/AccountMainPanel";
import { ProductCard } from "@/components/store/ProductCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wishlist | My Account | UKLAI",
};

export default async function AccountWishlistPage() {
  const user = await getUser();
  if (!user) return null;

  const products = await getUserWishlistProducts(user.id);

  return (
    <AccountMainPanel>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">
            Wishlist
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Products you saved for later.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Heart className="w-7 h-7 text-red-400" aria-hidden="true" />
            </div>
            <p className="text-slate-900 font-semibold">Your wishlist is empty</p>
            <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              Tap the heart on any product to save it here.
            </p>
            <Link
              href="/shop"
              className="inline-flex mt-6 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark"
            >
              Browse shop
            </Link>
          </div>
        ) : (
          <div className="p-4 sm:p-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </AccountMainPanel>
  );
}
