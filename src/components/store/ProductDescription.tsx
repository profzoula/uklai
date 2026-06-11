import {
  parseProductDescription,
  type ProductDescriptionBlock,
} from "@/lib/format-product-description";

type Props = {
  description: string | null | undefined;
};

function SpecList({ specs }: { specs: Extract<ProductDescriptionBlock, { type: "spec" }>[] }) {
  return (
    <dl className="mt-4 grid gap-x-4 gap-y-2 sm:grid-cols-[minmax(7rem,auto)_1fr]">
      {specs.map((spec) => (
        <div key={spec.label} className="contents">
          <dt className="text-sm font-semibold text-slate-900">{spec.label}</dt>
          <dd className="text-sm text-slate-600">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function FeatureList({
  features,
}: {
  features: Extract<ProductDescriptionBlock, { type: "feature" }>[];
}) {
  return (
    <ul className="mt-4 space-y-1.5">
      {features.map((feature) => (
        <li
          key={feature.text}
          className="text-sm text-slate-600 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-slate-400"
        >
          {feature.text}
        </li>
      ))}
    </ul>
  );
}

export function ProductDescription({ description }: Props) {
  const { blocks, hasStructuredContent } = parseProductDescription(description);

  if (!blocks.length) {
    return (
      <p className="text-sm text-slate-400 italic">
        No description available for this product.
      </p>
    );
  }

  const paragraphs = blocks.filter((b) => b.type === "paragraph");
  const specs = blocks.filter((b) => b.type === "spec");
  const features = blocks.filter((b) => b.type === "feature");

  if (!hasStructuredContent && paragraphs.length === 1 && !specs.length) {
    return (
      <p className="text-sm text-slate-600 leading-relaxed">{paragraphs[0].text}</p>
    );
  }

  return (
    <div className="space-y-4">
      {paragraphs.map((block) => (
        <p key={block.text} className="text-sm text-slate-600 leading-relaxed">
          {block.text}
        </p>
      ))}

      {specs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-900">Specifications</h3>
          <SpecList specs={specs} />
        </div>
      )}

      {features.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-900">Features</h3>
          <FeatureList features={features} />
        </div>
      )}
    </div>
  );
}
