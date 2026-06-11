export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 print:bg-white py-8 print:py-0 px-4 print:px-0">
      {children}
    </div>
  );
}
