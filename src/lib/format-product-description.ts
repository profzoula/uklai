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
] as const;

const FEATURE_SPLIT =
  /\s+(?=USB[-\s]|HDMI|Wi-Fi|WiFi|Ethernet|Bluetooth|Thunderbolt|Backlit|Built-in|Fingerprint|Touchscreen|SD Card|Numeric Keypad|Optical Drive|Wireless|Mechanical Keyboard|Card Reader|Webcam|Microphone|Keyboard|Trackpad|Speaker)/i;

const BULLET_LINE = /^(?:[-*•–—]|\d+[.)])\s+/;

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

function normalizeWhitespace(text: string): string {
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

function splitFeatureTokens(text: string): string[] {
  if (!text) return [];
  return text
    .split(FEATURE_SPLIT)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseSpecSection(specsText: string): ProductDescriptionBlock[] {
  const labelPattern = SPEC_LABELS.map((label) =>
    label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  ).join("|");

  const regex = new RegExp(`(?:^|\\s)(${labelPattern}):\\s*`, "gi");
  const matches = [...specsText.matchAll(regex)];

  if (!matches.length) {
    return splitFeatureTokens(specsText).map((text) => ({
      type: "feature" as const,
      text,
    }));
  }

  const blocks: ProductDescriptionBlock[] = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const label = match[1].trim();
    const valueStart = (match.index ?? 0) + match[0].length;
    const valueEnd =
      i + 1 < matches.length
        ? (matches[i + 1].index ?? specsText.length)
        : specsText.length;

    let value = specsText.slice(valueStart, valueEnd).trim();
    const isLast = i === matches.length - 1;

    if (isLast && label.toLowerCase() === "color") {
      const featureParts = splitFeatureTokens(value);
      if (featureParts.length > 1) {
        blocks.push({ type: "spec", label, value: featureParts[0] });
        for (const feature of featureParts.slice(1)) {
          blocks.push({ type: "feature", text: feature });
        }
        continue;
      }
    }

    if (isLast) {
      const embeddedFeatures = splitFeatureTokens(value);
      if (embeddedFeatures.length > 1) {
        const [first, ...rest] = embeddedFeatures;
        const looksLikeSpecValue = !/^(USB|HDMI|Wi-Fi|Bluetooth|Backlit|Built-in|Fingerprint|Touchscreen|SD Card)/i.test(
          first
        );
        if (looksLikeSpecValue) {
          blocks.push({ type: "spec", label, value: first });
          for (const feature of rest) {
            blocks.push({ type: "feature", text: feature });
          }
          continue;
        }
      }
    }

    blocks.push({ type: "spec", label, value });
  }

  return blocks;
}

function parsePlainTextBlocks(text: string): ProductDescriptionBlock[] {
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const blocks: ProductDescriptionBlock[] = [];
  let paragraphBuffer: string[] = [];

  function flushParagraph() {
    if (!paragraphBuffer.length) return;
    blocks.push({
      type: "paragraph",
      text: normalizeWhitespace(paragraphBuffer.join(" ")),
    });
    paragraphBuffer = [];
  }

  for (const line of lines) {
    if (BULLET_LINE.test(line)) {
      flushParagraph();
      blocks.push({
        type: "feature",
        text: line.replace(BULLET_LINE, "").trim(),
      });
      continue;
    }

    if (line.length < 80 && line.includes(":") && !line.startsWith("http")) {
      const colonIndex = line.indexOf(":");
      const label = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      const isKnownSpec = SPEC_LABELS.some(
        (spec) => spec.toLowerCase() === label.toLowerCase()
      );
      if (isKnownSpec && value) {
        flushParagraph();
        blocks.push({ type: "spec", label, value });
        continue;
      }
    }

    paragraphBuffer.push(line);
  }

  flushParagraph();
  return blocks;
}

function extractHtmlBlocks(raw: string): ProductDescriptionBlock[] | null {
  if (!/<[a-z][\s\S]*>/i.test(raw)) return null;

  const blocks: ProductDescriptionBlock[] = [];

  const listMatches = raw.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi);
  for (const match of listMatches) {
    const text = normalizeWhitespace(
      stripHtmlTags(decodeHtmlEntities(match[1]))
    );
    if (text) blocks.push({ type: "feature", text });
  }

  const paragraphMatches = raw.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  for (const match of paragraphMatches) {
    const text = normalizeWhitespace(
      stripHtmlTags(decodeHtmlEntities(match[1]))
    );
    if (text) blocks.push({ type: "paragraph", text });
  }

  if (blocks.length) return blocks;

  const stripped = normalizeWhitespace(
    stripHtmlTags(decodeHtmlEntities(raw))
  );
  return stripped ? parsePlainTextBlocks(stripped) : [];
}

export function parseProductDescription(raw: string | null | undefined): {
  blocks: ProductDescriptionBlock[];
  hasStructuredContent: boolean;
} {
  if (!raw?.trim()) {
    return { blocks: [], hasStructuredContent: false };
  }

  const decoded = decodeHtmlEntities(raw);
  const htmlBlocks = extractHtmlBlocks(decoded);
  if (htmlBlocks?.length) {
    const hasStructure = htmlBlocks.some((b) => b.type !== "paragraph");
    return {
      blocks: htmlBlocks,
      hasStructuredContent: htmlBlocks.length > 1 || hasStructure,
    };
  }

  const withLineBreaks = stripHtmlTags(decoded);
  const labelPattern = SPEC_LABELS.map((label) =>
    label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  ).join("|");

  const paragraphs = withLineBreaks
    .split(/\n{2,}/)
    .map((part) => normalizeWhitespace(part))
    .filter(Boolean);

  if (paragraphs.length > 1) {
    const blocks = paragraphs.flatMap((part) => parsePlainTextBlocks(part));
    return {
      blocks,
      hasStructuredContent: blocks.some((b) => b.type !== "paragraph"),
    };
  }

  const text = normalizeWhitespace(withLineBreaks);
  const splitRegex = new RegExp(`\\s(?=(?:${labelPattern}):\\s)`, "i");
  const splitIndex = text.search(splitRegex);

  if (splitIndex === -1) {
    const lineBlocks = parsePlainTextBlocks(withLineBreaks);
    if (lineBlocks.some((b) => b.type !== "paragraph")) {
      return {
        blocks: lineBlocks,
        hasStructuredContent: true,
      };
    }

    return {
      blocks: text ? [{ type: "paragraph", text }] : [],
      hasStructuredContent: false,
    };
  }

  const intro = text.slice(0, splitIndex).trim();
  const specsText = text.slice(splitIndex).trim();
  const blocks: ProductDescriptionBlock[] = [];

  if (intro) {
    blocks.push({ type: "paragraph", text: intro });
  }

  blocks.push(...parseSpecSection(specsText));

  return {
    blocks,
    hasStructuredContent: blocks.length > 1,
  };
}
