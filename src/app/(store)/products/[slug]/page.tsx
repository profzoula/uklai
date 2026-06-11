import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import { getApprovedReviewsForProduct } from "@/lib/account-data";
import {
  getProductGallery,
  getProductHighlights,
  getProductCategory,
} from "@/lib/product-utils";
import { getStoreSettings } from "@/lib/store-settings";
import { calculateDiscount } from "@/lib/utils";
import { ProductBreadcrumbs } from "@/components/store/ProductBreadcrumbs";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductRating } from "@/components/store/ProductRating";
import { ProductActions } from "@/components/store/ProductActions";
import { ProductReviewsSection } from "@/components/store/ProductReviewsSection";
import { ProductDescription } from "@/components/store/ProductDescription";
import { RelatedProductsSection } from "@/components/store/RelatedProductsSection";
import { ProductPriceBlock } from "@/components/store/ProductPriceBlock";
import { ProductDetailAccordion } from "@/components/store/ProductDetailAccordion";
import { ProductDetailTabs } from "@/components/store/ProductDetailTabs";
import { ProductTrustBox } from "@/components/store/ProductTrustBox";
import { ProductShareRow } from "@/components/store/ProductShareRow";
import { Check } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [reviews, relatedProducts, settings] = await Promise.all([
    getApprovedReviewsForProduct(product.id),
    getRelatedProducts(product, 8),
    getStoreSettings(),
  ]);

  const category = getProductCategory(product);
  const gallery = getProductGallery(product);
  const highlights = getProductHighlights(product);
  const discountPercent = calculateDiscount(
    product.price,
    product.compare_at_price
  );

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

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
        <ProductGallery
          images={gallery}
          productName={product.name}
          discountPercent={discountPercent}
        />

        <div className="lg:pt-1">
          {category && (
            <Link
              href={`/shop?category=${category.slug}`}
              className="inline-flex text-sm font-semibold text-primary bg-primary-light px-3.5 py-1.5 rounded-full hover:bg-primary/15 transition-colors mb-3"
            >
              {category.name}
            </Link>
          )}

          <h1 className="text-[1.65rem] leading-snug sm:text-[1.75rem] lg:text-3xl font-bold text-slate-900 tracking-tight">
            {product.name}
          </h1>

          <div className="mt-3">
            <ProductRating product={product} />
          </div>

          <div className="mt-5">
            <ProductPriceBlock product={product} />
          </div>

          {highlights.length > 0 && (
            <ul className="mt-5 space-y-1.5 border-t border-slate-100 pt-5">
              {highlights.slice(0, 3).map((item) => (
                <li
                  key={item}
                  className="text-base sm:text-sm text-slate-600 pl-1 leading-relaxed"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6">
            <ProductActions product={product} />
          </div>

          <ProductDetailAccordion settings={settings} />

          <ProductShareRow sku={product.sku} productName={product.name} />
        </div>
      </div>

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
