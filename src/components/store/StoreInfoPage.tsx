import Link from "next/link";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function StoreInfoPage({ title, children }: Props) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <Link
        href="/"
        className="text-sm font-medium text-primary hover:text-primary-dark mb-6 inline-block"
      >
        ← Back to store
      </Link>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">{title}</h1>
      <div className="prose prose-slate prose-sm max-w-none space-y-4 text-slate-600 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
