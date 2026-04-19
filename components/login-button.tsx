"use client";

import { createClient } from "@/utils/supabase/client";
import { GOOGLE_SCOPES } from "@/lib/constants";
import { Tent } from "lucide-react";

export default function LoginButton() {
  const supabase = createClient();
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        scopes: GOOGLE_SCOPES,
      },
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-zinc-100 transition-all border border-zinc-200 shadow-sm"
    >
      <Tent size={18} />
      Continue with Google
    </button>
  );
}
