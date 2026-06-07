import { Hero } from "@/components/store/Hero";
import { CategoryGrid } from "@/components/store/CategoryGrid";
import { FeaturedProducts } from "@/components/store/FeaturedProducts";
import { WhyShopWithUs } from "@/components/store/WhyShopWithUs";
import { ImpactStats } from "@/components/store/ImpactStats";
import { Newsletter } from "@/components/store/Newsletter";
import {
  getCategories,
  getProducts,
  getProductsByCollectionSlug,
  getCollectionBySlug,
} from "@/lib/data";

export default async function HomePage() {
  const [categories, featured, bestSellers, newArrivals, bestMeta, newMeta] =
    await Promise.all([
      getCategories(),
      getProducts({ featured: true, limit: 10 }),
      getProductsByCollectionSlug("best-sellers", 10),
      getProductsByCollectionSlug("new-arrivals", 10),
      getCollectionBySlug("best-sellers"),
      getCollectionBySlug("new-arrivals"),
    ]);

  return (
    <>
      <Hero />
      <CategoryGrid categories={categories} />
      <FeaturedProducts
        products={bestSellers}
        title={bestMeta?.name ?? "Best Sellers"}
        subtitle={
          bestMeta?.description ?? "Our most popular items loved by customers."
        }
        viewAllHref="/shop?collection=best-sellers"
        viewAllLabel="Shop best sellers"
        variant="light"
      />
      <FeaturedProducts
        products={newArrivals}
        title={newMeta?.name ?? "New Arrivals"}
        subtitle={
          newMeta?.description ?? "Fresh picks — the latest products just landed."
        }
        viewAllHref="/shop?collection=new-arrivals"
        viewAllLabel="Shop new arrivals"
        variant="muted"
      />
      <FeaturedProducts products={featured} />
      <WhyShopWithUs />
      <ImpactStats />
      <Newsletter />
    </>
  );
}
