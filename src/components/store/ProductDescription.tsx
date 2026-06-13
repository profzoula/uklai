import {
  parseProductDescription,
  type ProductDescriptionBlock,
} from "@/lib/format-product-description";

type Props = {
  description: string | null | undefined;
};

function SpecRow({
  spec,
}: {
  spec: Extract<ProductDescriptionBlock, { type: "spec" }>;
}) {
  return (
    <div className="contents">
      <dt className="text-base sm:text-sm font-semibold text-slate-900">{spec.label}</dt>
      <dd className="text-base sm:text-sm text-slate-600">{spec.value}</dd>
    </div>
  );
}

function FeatureItem({
  feature,
}: {
  feature: Extract<ProductDescriptionBlock, { type: "feature" }>;
}) {
  return (
    <li
      className="text-base sm:text-sm text-slate-600 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-slate-400"
    >
      {feature.text}
    </li>
  );
}

function BlockGroup({
  blocks,
  startIndex,
}: {
  blocks: ProductDescriptionBlock[];
  startIndex: number;
}) {
  if (!blocks.length) return null;

  const firstType = blocks[0].type;

  if (firstType === "paragraph") {
    return (
      <>
        {blocks.map((block, i) =>
          block.type === "paragraph" ? (
            <p
              key={`p-${startIndex + i}`}
              className="text-base sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line"
            >
              {block.text}
            </p>
          ) : null
        )}
      </>
    );
  }

  if (firstType === "spec") {
    return (
      <div>
        <h3 className="text-base font-bold text-slate-900">Specifications</h3>
        <dl className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-[minmax(7rem,auto)_1fr]">
          {blocks.map((block, i) =>
            block.type === "spec" ? (
              <SpecRow key={`spec-${startIndex + i}`} spec={block} />
            ) : null
          )}
        </dl>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-bold text-slate-900">Features</h3>
      <ul className="mt-3 space-y-1.5">
        {blocks.map((block, i) =>
          block.type === "feature" ? (
            <FeatureItem
              key={`feat-${startIndex + i}-${block.text.slice(0, 24)}`}
              feature={block}
            />
          ) : null
        )}
      </ul>
    </div>
  );
}

function groupConsecutiveBlocks(blocks: ProductDescriptionBlock[]) {
  const groups: { type: ProductDescriptionBlock["type"]; blocks: ProductDescriptionBlock[]; startIndex: number }[] = [];

  blocks.forEach((block, index) => {
    const last = groups[groups.length - 1];
    if (last && last.type === block.type) {
      last.blocks.push(block);
      return;
    }
    groups.push({ type: block.type, blocks: [block], startIndex: index });
  });

  return groups;
}

export function ProductDescription({ description }: Props) {
  const { blocks, hasStructuredContent } = parseProductDescription(description);

  if (!blocks.length) {
    return (
      <p className="text-base sm:text-sm text-slate-400 italic">
        No description available for this product.
      </p>
    );
  }

  if (!hasStructuredContent && blocks.length === 1 && blocks[0].type === "paragraph") {
    return (
      <p className="text-base sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">{blocks[0].text}</p>
    );
  }

  const groups = groupConsecutiveBlocks(blocks);

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <BlockGroup
          key={`${group.type}-${group.startIndex}`}
          blocks={group.blocks}
          startIndex={group.startIndex}
        />
      ))}
    </div>
  );
}
