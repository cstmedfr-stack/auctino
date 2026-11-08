
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

// Păstrăm dovada evenimentului de recuperare
// pentru cazul în care React se inițializează
// după ce Supabase a procesat linkul.
//
// Nu stocăm parole sau tokenuri în acest indicator.

export const PASSWORD_RECOVERY_KEY =
  "vandivo-password-recovery";

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY" && session?.user) {
      window.sessionStorage.setItem(
        PASSWORD_RECOVERY_KEY,
        JSON.stringify({
          userId: session.user.id,
          createdAt: Date.now(),
        })
      );
    }

    if (event === "SIGNED_OUT") {
      window.sessionStorage.removeItem(
        PASSWORD_RECOVERY_KEY
      );
    }
  });
}
