import Link from "next/link";
import { BrandLogo } from "@/components/store/BrandLogo";

const footerLinks = {
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/contact" },
    { label: "Press", href: "/contact" },
    { label: "Blog", href: "/about" },
  ],
  Support: [
    { label: "Contact Us", href: "/contact" },
    { label: "Track Order", href: "/track-order" },
    { label: "FAQs", href: "/faq" },
    { label: "Returns", href: "/returns" },
  ],
  Legal: [
    { label: "Legal hub", href: "/legal" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Returns & Refunds", href: "/returns" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Accessibility", href: "/accessibility" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm shrink-0">
            <BrandLogo href="/" variant="white" size="footer" className="mb-4" />
            <p className="text-sm leading-relaxed">
              Discover premium products at unbeatable prices curated for
              quality, comfort and style.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 sm:gap-10 lg:gap-16 lg:ml-auto">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="min-w-0">
                <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                  {title}
                </h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-xs sm:text-sm hover:text-white transition-colors leading-snug"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm">
          © {new Date().getFullYear()} UKLAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
