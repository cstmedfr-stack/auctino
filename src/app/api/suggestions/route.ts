import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type TurnstileResponse = {
  success?: boolean;
  hostname?: string;
};

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    const requestUrl = new URL(request.url);

    if (origin) {
      let originUrl: URL;
      try {
        originUrl = new URL(origin);
      } catch {
        return fail("Origine invalidă.", 403);
      }
      if (originUrl.origin !== requestUrl.origin) {
        return fail("Cerere nepermisă.", 403);
      }
    }

    if (!(request.headers.get("content-type") ?? "").includes("application/json")) {
      return fail("Format invalid.", 415);
    }

    const rawBody = await request.text();
    if (rawBody.length > 6000) {
      return fail("Cerere prea mare.", 413);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return fail("Date invalide.", 400);
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return fail("Date invalide.", 400);
    }

    const body = parsed as Record<string, unknown>;

    // Honeypot: bots may fill an input hidden from ordinary visitors.
    // In that case, we pretend the request succeeded without saving it.
    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({ ok: true });
    }

    const categories = new Set(["category", "feature", "bug", "design", "other"]);
    const category = body.category;
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const turnstileToken = body.turnstileToken;

    if (typeof category !== "string" || !categories.has(category)) {
      return fail("Alege tipul sugestiei.", 400);
    }
    if (message.length < 10 || message.length > 2000) {
      return fail("Mesajul trebuie să aibă între 10 și 2000 de caractere.", 400);
    }
    if (
      typeof turnstileToken !== "string" ||
      turnstileToken.length === 0 ||
      turnstileToken.length > 2048
    ) {
      return fail("Verificarea de securitate este necesară.", 403);
    }

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!turnstileSecret || !supabaseUrl || !supabaseSecret) {
      console.error("Suggestions API: server environment is incomplete");
      return fail("Serviciul nu este disponibil momentan.", 503);
    }

    // Prevent accidental deployment of Cloudflare's always-pass test key.
    if (
      process.env.NODE_ENV === "production" &&
      turnstileSecret === "1x0000000000000000000000000000000AA"
    ) {
      console.error("Suggestions API: test Turnstile key used in production");
      return fail("Serviciul nu este disponibil momentan.", 503);
    }

    let verification: TurnstileResponse;
    try {
      const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: turnstileSecret,
            response: turnstileToken,
          }),
          signal: AbortSignal.timeout(10000),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Turnstile verification service unavailable");
      }

      verification = (await response.json()) as TurnstileResponse;
    } catch {
      return fail("Verificarea de securitate nu a reușit. Încearcă din nou.", 503);
    }

   const isLocalTest =
  process.env.NODE_ENV !== "production" &&
  turnstileSecret === "1x0000000000000000000000000000000AA" &&
  (
    requestUrl.hostname === "localhost" ||
    requestUrl.hostname === "127.0.0.1"
  );

if (
  !verification.success ||
  (
    !isLocalTest &&
    verification.hostname?.toLowerCase() !==
      requestUrl.hostname.toLowerCase()
  )
) {
  return fail(
    "Verificarea de securitate nu a reușit. Încearcă din nou.",
    403
  );
}

    // Do not forward the visitor's access token to this privileged client.
    const supabase = createClient(supabaseUrl, supabaseSecret, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    const { error } = await supabase.from("site_suggestions").insert({
      category,
      message,
    });

    if (error) {
      console.error("Suggestions API: database insert failed", error.code);
      return fail("Sugestia nu a putut fi salvată.", 500);
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return fail("A apărut o eroare. Încearcă din nou.", 500);
  }
}
