import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProductVariants,
  getRelatedProducts,
} from "@/lib/data";
import { getApprovedReviewsForProduct } from "@/lib/account-data";
import {
  getProductGallery,
  getProductHighlights,
  getProductCategory,
} from "@/lib/product-utils";
import { getStoreSettings } from "@/lib/store-settings";
import { ProductBreadcrumbs } from "@/components/store/ProductBreadcrumbs";
import { ProductDetailMain } from "@/components/store/ProductDetailMain";
import { ProductReviewsSection } from "@/components/store/ProductReviewsSection";
import { ProductDescription } from "@/components/store/ProductDescription";
import { RelatedProductsSection } from "@/components/store/RelatedProductsSection";
import { ProductDetailTabs } from "@/components/store/ProductDetailTabs";
import { ProductTrustBox } from "@/components/store/ProductTrustBox";
import { Check } from "lucide-react";
import type { Category } from "@/types/database";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [reviews, relatedProducts, settings, variants] = await Promise.all([
    getApprovedReviewsForProduct(product.id),
    getRelatedProducts(product, 8),
    getStoreSettings(),
    getProductVariants(product.id),
  ]);

  const category = getProductCategory(product) as Category | null;
  const gallery = getProductGallery(product);
  const highlights = getProductHighlights(product);

  const descriptionPanel = (
    <div className="space-y-6">
      <ProductDescription description={product.description} />
      {highlights.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-3">
            Key highlights
          </h3>
          <ul className="space-y-2">
            {highlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-base sm:text-sm text-slate-600"
              >
                <Check
                  className="w-4 h-4 text-primary shrink-0 mt-0.5"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const reviewsPanel = (
    <ProductReviewsSection
      product={product}
      reviews={reviews}
      embedded
    />
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      <ProductBreadcrumbs
        product={product}
        categoryName={category?.name}
        categorySlug={category?.slug}
      />

      <ProductDetailMain
        product={product}
        variants={variants}
        gallery={gallery}
        category={category}
        highlightPreview={highlights.slice(0, 3)}
        settings={settings}
      />

      <div className="mt-12 lg:mt-14 grid lg:grid-cols-[1fr_280px] gap-8 lg:gap-10 items-start">
        <ProductDetailTabs
          reviewCount={product.review_count}
          descriptionPanel={descriptionPanel}
          reviewsPanel={reviewsPanel}
        />
        <ProductTrustBox
          freeShippingThreshold={settings.shipping.free_shipping_threshold}
        />
      </div>

      <RelatedProductsSection
        products={relatedProducts}
        categoryName={category?.name}
        categorySlug={category?.slug}
      />
    </div>
  );
}
