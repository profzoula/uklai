import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded-md focus:shadow-lg focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
