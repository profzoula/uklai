"use client";

import { Star } from "lucide-react";
import { formatPrice, calculateDiscount } from "@/lib/utils";

type PreviewData = {
  name: string;
  slug: string;
  description: string;
  price: string;
  compare_at_price: string;
  image_url: string;
  badge: string;
  stock: string;
  rating: string;
  review_count: string;
  featured: boolean;
  active: boolean;
  highlights: string[];
};

type Props = {
  data: PreviewData;
  categoryName?: string;
};

export function ProductFormPreview({ data, categoryName }: Props) {
  const price = parseFloat(data.price) || 0;
  const compareAt = data.compare_at_price
    ? parseFloat(data.compare_at_price)
    : null;
  const discount = calculateDiscount(price, compareAt);
  const savings =
    compareAt && compareAt > price ? compareAt - price : null;
  const stock = parseInt(data.stock) || 0;
  const rating = parseFloat(data.rating) || 0;
  const reviewCount = parseInt(data.review_count) || 0;

  const stockLabel =
    stock <= 0 ? "Out of stock" : stock <= 10 ? "Low stock" : "In stock";
  const stockColor =
    stock <= 0
      ? "text-red-600 bg-red-50"
      : stock <= 10
        ? "text-amber-600 bg-amber-50"
        : "text-green-600 bg-green-50";

  return (
    <div className="lg:sticky lg:top-24 space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Store preview
        </p>

        <div className="rounded-xl overflow-hidden bg-slate-100 aspect-square mb-4">
          {data.image_url ? (
            <img
              src={data.image_url}
              alt={data.name || "Preview"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
              No image
            </div>
          )}
        </div>

        {data.badge && (
          <span className="inline-block text-xs font-semibold bg-primary text-white px-2.5 py-1 rounded-full mb-2">
            {data.badge}
          </span>
        )}

        <h3 className="font-bold text-slate-900 text-lg leading-tight">
          {data.name || "Product name"}
        </h3>

        {categoryName && (
          <p className="text-xs text-slate-500 mt-1">{categoryName}</p>
        )}

        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.round(rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500">
            {rating.toFixed(1)} ({reviewCount})
          </span>
        </div>

        <div className="mt-3">
          <p className="text-xl font-bold text-slate-900">
            {formatPrice(price)}
          </p>
          {savings !== null && (
            <p className="text-sm text-red-600 font-medium">
              Save {formatPrice(savings)}
              {discount !== null && ` (${discount}% off)`}
            </p>
          )}
          {compareAt && compareAt > price && (
            <p className="text-sm text-slate-500">
              Comp. Value: {formatPrice(compareAt)}
            </p>
          )}
        </div>

        {data.highlights.filter(Boolean).length > 0 && (
          <ul className="mt-4 space-y-1">
            {data.highlights.filter(Boolean).slice(0, 3).map((item) => (
              <li key={item} className="text-xs text-slate-600 pl-1">
                • {item}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${stockColor}`}>
            {stockLabel} ({stock})
          </span>
          {data.featured && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary-light text-primary">
              Featured
            </span>
          )}
          {!data.active && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600">
              Hidden
            </span>
          )}
        </div>
      </div>

      {data.slug && (
        <p className="text-xs text-slate-400 text-center break-all">
          /products/{data.slug}
        </p>
      )}
    </div>
  );
}
