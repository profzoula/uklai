export type ProductDescriptionBlock =
  | { type: "paragraph"; text: string }
  | { type: "spec"; label: string; value: string }
  | { type: "feature"; text: string };

const SPEC_LABELS = [
  "Operating System",
  "Processor",
  "Memory",
  "Storage",
  "Graphics",
  "Display",
  "Connectivity",
  "Battery",
  "Dimensions",
  "Weight",
  "Brand",
  "Model",
  "Color",
  "RAM",
  "CPU",
  "OS",
  "Material",
  "Size",
  "Capacity",
  "Warranty",
  "Features",
  "Condition",
  "Package Dimensions",
  "Package Weight",
  "État",
  "Marque",
  "Modèle",
  "Type",
  "Remarque du vendeur",
  "Informations générales",
] as const;

const BULLET_LINE =
  /^(?:[-*•–—]|\d+[.)]|[✅✔✓☑])\s*/;

const SPEC_LINE = new RegExp(
  `^(${SPEC_LABELS.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")}):\\s*(.+)$`,
  "i"
);

const GENERIC_SPEC_LINE =
  /^([A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9 /&().'-]{0,45}):\s*(.+)$/;

const SECTION_HEADER =
  /^(Key Features|Perfect For|What's Included|Condition|Specifications?|Dimensions|Weight|Size|Détails de l'article|Informations générales|Caractéristiques principales|Perfect for|What's in the box)$/i;

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"');
}

function normalizeInline(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function stripHtmlTags(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\n{3,}/g, "\n\n");
}

function isGenericSpecLine(line: string): boolean {
  if (SPEC_LINE.test(line)) return true;
  const match = line.match(GENERIC_SPEC_LINE);
  if (!match) return false;
  const label = match[1].trim();
  if (/^https?$/i.test(label)) return false;
  return label.length >= 2;
}

/** Clean pasted text before parsing — keeps structure, fixes common paste issues. */
export function preProcessDescription(raw: string): string {
  let text = decodeHtmlEntities(raw).replace(/\r\n/g, "\n");
  text = stripHtmlTags(text);

  text = text.replace(/^[\t ]*[✅✔✓☑]\s*/gm, "- ");
  text = text.replace(/^[ \t]+/gm, "");
  text = text.replace(/[ \t]+$/gm, "");

  text = text.replace(
    /([^\n])\n(?=(Key Features|Perfect For|What's Included|Condition|Specifications?|Dimensions|Weight|Détails de l'article|Informations générales|Caractéristiques principales|What's in the box))/gi,
    "$1\n\n"
  );

  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

function extractHtmlBlocks(raw: string): ProductDescriptionBlock[] | null {
  if (!/<[a-z][\s\S]*>/i.test(raw)) return null;

  const blocks: ProductDescriptionBlock[] = [];

  for (const match of raw.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)) {
    const text = normalizeInline(
      stripHtmlTags(decodeHtmlEntities(match[1]))
    );
    if (text) blocks.push({ type: "feature", text });
  }

  for (const match of raw.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const text = normalizeInline(
      stripHtmlTags(decodeHtmlEntities(match[1]))
    );
    if (text) blocks.push({ type: "paragraph", text });
  }

  if (blocks.length) return blocks;

  const stripped = preProcessDescription(raw);
  return stripped ? parsePlainTextBlocks(stripped) : [];
}

function parseSpecRun(lines: string[]): ProductDescriptionBlock[] {
  const blocks: ProductDescriptionBlock[] = [];

  for (const line of lines) {
    if (SECTION_HEADER.test(line)) continue;

    const known = line.match(SPEC_LINE);
    if (known) {
      const label =
        SPEC_LABELS.find((l) => l.toLowerCase() === known[1].toLowerCase()) ??
        known[1];
      blocks.push({ type: "spec", label, value: known[2].trim() });
      continue;
    }

    const generic = line.match(GENERIC_SPEC_LINE);
    if (generic) {
      blocks.push({
        type: "spec",
        label: generic[1].trim(),
        value: generic[2].trim(),
      });
      continue;
    }

    blocks.push({ type: "paragraph", text: line });
  }

  return blocks;
}

function parsePlainTextBlocks(text: string): ProductDescriptionBlock[] {
  const sections = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  const blocks: ProductDescriptionBlock[] = [];

  for (const section of sections) {
    const lines = section
      .split(/\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) continue;

    if (lines.length === 1 && SECTION_HEADER.test(lines[0])) {
      continue;
    }

    const bulletLines = lines.filter((line) => BULLET_LINE.test(line));
    if (bulletLines.length >= 2 && bulletLines.length === lines.length) {
      for (const line of lines) {
        blocks.push({
          type: "feature",
          text: line.replace(BULLET_LINE, "").trim(),
        });
      }
      continue;
    }

    const specLines = lines.filter((line) => isGenericSpecLine(line));
    if (
      specLines.length >= 2 &&
      specLines.length >= lines.length - 1
    ) {
      blocks.push(...parseSpecRun(lines));
      continue;
    }

    blocks.push({
      type: "paragraph",
      text: lines
        .filter((line) => !SECTION_HEADER.test(line))
        .map((line) => line.replace(BULLET_LINE, "").trim())
        .join("\n"),
    });
  }

  return blocks;
}

export function parseProductDescription(raw: string | null | undefined): {
  blocks: ProductDescriptionBlock[];
  hasStructuredContent: boolean;
} {
  if (!raw?.trim()) {
    return { blocks: [], hasStructuredContent: false };
  }

  const decoded = preProcessDescription(raw);

  const htmlBlocks = extractHtmlBlocks(decoded);
  if (htmlBlocks?.length && /<[a-z][\s\S]*>/i.test(raw)) {
    const hasStructure = htmlBlocks.some((b) => b.type !== "paragraph");
    return {
      blocks: htmlBlocks,
      hasStructuredContent:
        htmlBlocks.length > 1 ||
        hasStructure ||
        htmlBlocks.some((b) => b.type === "spec"),
    };
  }

  const blocks = parsePlainTextBlocks(decoded);
  const hasStructure = blocks.some((b) => b.type !== "paragraph");

  return {
    blocks,
    hasStructuredContent: hasStructure,
  };
}

/** Serialize parsed blocks back to clean plain text for storage. */
export function descriptionBlocksToText(
  blocks: ProductDescriptionBlock[]
): string {
  const sections: string[] = [];
  let featureRun: string[] = [];
  let specRun: Extract<ProductDescriptionBlock, { type: "spec" }>[] = [];

  function flushFeatures() {
    if (!featureRun.length) return;
    sections.push(featureRun.map((text) => `- ${text}`).join("\n"));
    featureRun = [];
  }

  function flushSpecs() {
    if (!specRun.length) return;
    sections.push(
      specRun.map((spec) => `${spec.label}: ${spec.value}`).join("\n")
    );
    specRun = [];
  }

  for (const block of blocks) {
    if (block.type === "feature") {
      flushSpecs();
      featureRun.push(block.text);
    } else if (block.type === "spec") {
      flushFeatures();
      specRun.push(block);
    } else {
      flushFeatures();
      flushSpecs();
      if (block.text.trim()) sections.push(block.text);
    }
  }

  flushFeatures();
  flushSpecs();

  return sections.join("\n\n").trim();
}

/** Normalize any stored description to clean plain text. */
export function normalizeProductDescription(
  raw: string | null | undefined
): string {
  if (!raw?.trim()) return "";

  let current = preProcessDescription(raw);
  for (let pass = 0; pass < 3; pass++) {
    const { blocks } = parseProductDescription(current);
    if (!blocks.length) return "";
    const next = descriptionBlocksToText(blocks);
    if (next === current) return next;
    current = next;
  }

  return current;
}
