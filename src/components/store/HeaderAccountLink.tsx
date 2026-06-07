"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function HeaderAccountLink() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const href = email ? "/account" : "/auth/login";
  const label = email ? "My account" : "Sign in";

  if (loading) {
    return (
      <div className="hidden md:flex items-center gap-2 px-2 py-1 opacity-70">
        <span className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
          <User className="w-4 h-4" strokeWidth={2} />
        </span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="hidden md:flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors"
    >
      <span className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shrink-0">
        <User className="w-4 h-4" strokeWidth={2} />
      </span>
      <div className="text-left leading-tight max-w-[120px]">
        <p className="text-[11px] text-white/80">Account</p>
        <p className="text-sm font-semibold truncate">{label}</p>
      </div>
    </Link>
  );
}
