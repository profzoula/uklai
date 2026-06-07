type Props = {
  title: string;
  description: string;
};

export function AdminPlaceholder({ title, description }: Props) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500 mt-1">{description}</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <p className="text-slate-500 text-sm">
          This section is ready for integration. Connect Supabase to enable
          live data.
        </p>
      </div>
    </div>
  );
}
