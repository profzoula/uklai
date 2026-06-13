import { BrandLogo } from "@/components/store/BrandLogo";

export function AuthBrandHeader() {
  return (
    <div className="text-center mb-8">
      <BrandLogo href="/" variant="blue" size="auth" className="mx-auto" />
    </div>
  );
}
