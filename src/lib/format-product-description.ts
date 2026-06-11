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
] as const;

const FEATURE_SPLIT =
  /\s+(?=USB[-\s]|HDMI|Wi-Fi|WiFi|Ethernet|Bluetooth|Thunderbolt|Backlit|Built-in|Fingerprint|Touchscreen|SD Card|Numeric Keypad|Optical Drive|Wireless|Mechanical Keyboard|Card Reader|Webcam|Microphone|Keyboard|Trackpad|Speaker)/i;

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
        ? matches[i + 1].index ?? specsText.length
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

export function parseProductDescription(raw: string | null | undefined): {
  blocks: ProductDescriptionBlock[];
  hasStructuredContent: boolean;
} {
  if (!raw?.trim()) {
    return { blocks: [], hasStructuredContent: false };
  }

  const text = normalizeWhitespace(decodeHtmlEntities(raw));
  const labelPattern = SPEC_LABELS.map((label) =>
    label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  ).join("|");
  const splitRegex = new RegExp(`\\s(?=(?:${labelPattern}):\\s)`, "i");
  const splitIndex = text.search(splitRegex);

  if (splitIndex === -1) {
    const paragraphs = text
      .split(/\n{2,}/)
      .map((part) => normalizeWhitespace(part))
      .filter(Boolean);

    return {
      blocks: paragraphs.map((part) => ({
        type: "paragraph" as const,
        text: part,
      })),
      hasStructuredContent: paragraphs.length > 1,
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
