import { Hero } from "@/components/store/Hero";
import { CategoryGrid } from "@/components/store/CategoryGrid";
import { DealOfTheDay } from "@/components/store/DealOfTheDay";
import { BestSellersSection } from "@/components/store/BestSellersSection";
import { NewArrivalsSection } from "@/components/store/NewArrivalsSection";
import { PromoBanner } from "@/components/store/PromoBanner";
import { FeaturedProducts } from "@/components/store/FeaturedProducts";
import { Newsletter } from "@/components/store/Newsletter";
import {
  getCategories,
  getProducts,
  getProductsByCollectionSlug,
  getCollectionBySlug,
} from "@/lib/data";
import { getStoreSettings } from "@/lib/store-settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    categories,
    featuredFromCollection,
    bestSellers,
    newArrivals,
    dealOfDay,
    featuredMeta,
    bestMeta,
    newMeta,
    dealMeta,
    settings,
  ] = await Promise.all([
    getCategories(),
    getProductsByCollectionSlug("featured", 12),
    getProductsByCollectionSlug("best-sellers", 12),
    getProductsByCollectionSlug("new-arrivals", 12),
    getProductsByCollectionSlug("deal-of-the-day", 12),
    getCollectionBySlug("featured"),
    getCollectionBySlug("best-sellers"),
    getCollectionBySlug("new-arrivals"),
    getCollectionBySlug("deal-of-the-day"),
    getStoreSettings(),
  ]);

  const featured =
    featuredFromCollection.length > 0
      ? featuredFromCollection
      : await getProducts({ featured: true, limit: 12 });

  const promo = settings.homepage?.promo;

  return (
    <>
      <Hero />
      <CategoryGrid categories={categories} />
      <DealOfTheDay
        products={dealOfDay}
        title={dealMeta?.name ?? "Deal of the Day"}
      />
      <BestSellersSection
        products={bestSellers}
        title={bestMeta?.name ?? "Best Sellers"}
        headline={bestMeta?.description}
      />
      <FeaturedProducts
        products={featured}
        title={featuredMeta?.name ?? "Featured Products"}
        description={featuredMeta?.description}
      />
      <NewArrivalsSection
        products={newArrivals}
        title={newMeta?.name ?? "New Arrivals"}
        description={newMeta?.description}
      />
      <PromoBanner
        headline={promo?.headline}
        highlight={promo?.highlight}
        subtext={promo?.subtext}
        href={promo?.href}
        buttonLabel={promo?.buttonLabel}
      />
      <Newsletter />
    </>
  );
}
