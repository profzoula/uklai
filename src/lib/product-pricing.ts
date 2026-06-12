/** WooCommerce-style regular vs sale price ↔ DB price / compare_at_price */

export type DisplayPrices = {
  /** Price the customer pays */
  currentPrice: number;
  /** Original price before discount, if on sale */
  regularPrice: number | null;
  onSale: boolean;
};

/** Normalize DB values for display (handles legacy inverted saves). */
export function getDisplayPrices(
  price: number,
  compareAtPrice: number | null | undefined
): DisplayPrices {
  const sale = Number(price);
  const compare =
    compareAtPrice != null && !Number.isNaN(compareAtPrice)
      ? Number(compareAtPrice)
      : null;

  if (compare == null) {
    return { currentPrice: sale, regularPrice: null, onSale: false };
  }

  // Canonical: compare_at = regular (higher), price = sale (lower)
  if (compare > sale) {
    return { currentPrice: sale, regularPrice: compare, onSale: true };
  }

  // Legacy inverted rows: price = regular, compare_at = sale
  if (sale > compare) {
    return { currentPrice: compare, regularPrice: sale, onSale: true };
  }

  return { currentPrice: sale, regularPrice: null, onSale: false };
}

export function dbPricesToFormFields(
  price: number,
  compareAtPrice: number | null | undefined
): { regular_price: string; sale_price: string } {
  const { currentPrice, regularPrice, onSale } = getDisplayPrices(
    price,
    compareAtPrice
  );

  if (onSale && regularPrice != null) {
    return {
      regular_price: String(regularPrice),
      sale_price: String(currentPrice),
    };
  }

  return {
    regular_price: String(currentPrice),
    sale_price: "",
  };
}

export function validateFormPrices(
  regularPrice: string,
  salePrice: string
): string | null {
  const regular = parseFloat(regularPrice);
  const saleTrim = salePrice.trim();
  if (!saleTrim) return null;

  const sale = parseFloat(saleTrim);
  if (Number.isNaN(regular) || regular < 0) {
    return "Enter a valid regular price first.";
  }
  if (Number.isNaN(sale) || sale < 0) {
    return "Sale price must be a valid number.";
  }
  if (sale >= regular) {
    return "Sale price must be less than the regular price.";
  }
  return null;
}

export function formFieldsToDbPrices(
  regularPrice: string,
  salePrice: string
): { price: number; compare_at_price: number | null } {
  if (validateFormPrices(regularPrice, salePrice)) {
    const regular = parseFloat(regularPrice);
    return {
      price: Number.isNaN(regular) ? 0 : regular,
      compare_at_price: null,
    };
  }

  const regular = parseFloat(regularPrice);
  const saleTrim = salePrice.trim();
  const sale = saleTrim ? parseFloat(saleTrim) : null;

  if (
    sale != null &&
    !Number.isNaN(sale) &&
    !Number.isNaN(regular) &&
    sale > 0 &&
    regular > sale
  ) {
    return { price: sale, compare_at_price: regular };
  }

  return {
    price: Number.isNaN(regular) ? 0 : regular,
    compare_at_price: null,
  };
}
