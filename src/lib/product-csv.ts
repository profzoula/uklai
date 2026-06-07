export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type ProductCsvRow = {
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  description: string | null;
  stock: number;
  category_id: string | null;
  sku: string | null;
  product_type: "physical" | "digital";
  digital_file_url: string | null;
  image_url: string | null;
  active: boolean;
  featured: boolean;
  badge: string | null;
  category_slug: string | null;
};

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (!value?.trim()) return defaultValue;
  const v = value.toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export function parseProductsCsv(csvText: string): {
  rows: ProductCsvRow[];
  errors: string[];
} {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return {
      rows: [],
      errors: ["CSV must include a header row and at least one product."],
    };
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const nameIdx = headers.indexOf("name");
  const priceIdx = headers.indexOf("price");

  if (nameIdx === -1 || priceIdx === -1) {
    return { rows: [], errors: ["CSV must include 'name' and 'price' columns."] };
  }

  const col = (key: string) => headers.indexOf(key);
  const rows: ProductCsvRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const name = cells[nameIdx]?.trim();
    const priceStr = cells[priceIdx]?.trim();

    if (!name) {
      errors.push(`Row ${i + 1}: missing name`);
      continue;
    }

    const price = parseFloat(priceStr);
    if (Number.isNaN(price) || price < 0) {
      errors.push(`Row ${i + 1}: invalid price`);
      continue;
    }

    const slugRaw = col("slug") >= 0 ? cells[col("slug")] : "";
    const slug = slugRaw?.trim() || slugify(name);

    const compareRaw =
      col("compare_at_price") >= 0 ? cells[col("compare_at_price")] : "";
    const compare = compareRaw ? parseFloat(compareRaw) : null;

    const stockRaw = col("stock") >= 0 ? cells[col("stock")] : "0";
    const stock = parseInt(stockRaw || "0", 10);

    const typeRaw =
      col("product_type") >= 0 ? cells[col("product_type")] : "physical";
    const product_type =
      typeRaw?.toLowerCase() === "digital" ? "digital" : "physical";

    rows.push({
      name,
      slug,
      price,
      compare_at_price: compare != null && !Number.isNaN(compare) ? compare : null,
      description:
        col("description") >= 0 ? cells[col("description")] || null : null,
      stock: Number.isNaN(stock) ? 0 : stock,
      category_id: null,
      sku: col("sku") >= 0 ? cells[col("sku")] || null : null,
      product_type,
      digital_file_url:
        col("digital_file_url") >= 0
          ? cells[col("digital_file_url")] || null
          : null,
      image_url:
        col("image_url") >= 0 ? cells[col("image_url")] || null : null,
      active: parseBool(
        col("active") >= 0 ? cells[col("active")] : undefined,
        true
      ),
      featured: parseBool(
        col("featured") >= 0 ? cells[col("featured")] : undefined,
        false
      ),
      badge: col("badge") >= 0 ? cells[col("badge")] || null : null,
      category_slug:
        col("category_slug") >= 0 ? cells[col("category_slug")] || null : null,
    });
  }

  return { rows, errors };
}

export const PRODUCT_CSV_TEMPLATE = `name,slug,price,compare_at_price,description,stock,category_slug,sku,product_type,digital_file_url,image_url,active,featured,badge
Sample Product,sample-product,29.99,39.99,Short description,100,electronics,SKU-001,physical,,https://example.com/image.jpg,true,false,New`;
