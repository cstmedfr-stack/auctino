
import { NextResponse } from "next/server";
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const categories = [
  "category",
  "feature",
  "bug",
  "design",
  "other",
];

const statuses = [
  "new",
  "reviewing",
  "accepted",
  "implemented",
  "rejected",
];

const PAGE_SIZE = 20;

type AdminContext =
  | {
      admin: SupabaseClient;
      response: null;
    }
  | {
      admin: null;
      response: NextResponse;
    };

function errorResponse(
  message: string,
  status: number
) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

async function getAdminContext(
  request: Request
): Promise<AdminContext> {
  const header =
    request.headers.get("authorization") ?? "";

  const match = /^Bearer\s+(.+)$/i.exec(header);
  const token = match?.[1]?.trim();

  if (!token || token.length > 8192) {
    return {
      admin: null,
      response: errorResponse(
        "Autentificare necesară.",
        401
      ),
    };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const secretKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !publicKey || !secretKey) {
    console.error(
      "Admin suggestions: Supabase configuration missing"
    );

    return {
      admin: null,
      response: errorResponse(
        "Configurare server incompletă.",
        503
      ),
    };
  }

  const authClient = createClient(url, publicKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser(token);

  if (authError || !user) {
    return {
      admin: null,
      response: errorResponse(
        "Sesiune invalidă sau expirată.",
        401
      ),
    };
  }

  // Cheia secretă rămâne exclusiv pe server.
  const admin = createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  // Nu avem încredere într-un rol trimis de browser.
  // Verificăm rolul actual direct în baza de date.
  const {
    data: profile,
    error: profileError,
  } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Admin suggestions: role lookup failed",
      profileError.code
    );

    return {
      admin: null,
      response: errorResponse(
        "Nu s-au putut verifica drepturile.",
        500
      ),
    };
  }

  if (profile?.role !== "admin") {
    return {
      admin: null,
      response: errorResponse(
        "Acces permis doar administratorilor.",
        403
      ),
    };
  }

  return {
    admin,
    response: null,
  };
}

export async function GET(request: Request) {
  const context = await getAdminContext(request);

  if (context.response) {
    return context.response;
  }

  const admin = context.admin;
  const url = new URL(request.url);

  const requestedPage = Number(
    url.searchParams.get("page") ?? "1"
  );

  const page =
    Number.isSafeInteger(requestedPage) &&
    requestedPage >= 1 &&
    requestedPage <= 10000
      ? requestedPage
      : 1;

  const category =
    url.searchParams.get("category") ?? "all";

  const status =
    url.searchParams.get("status") ?? "all";

  if (
    (category !== "all" &&
      !categories.includes(category)) ||
    (status !== "all" &&
      !statuses.includes(status))
  ) {
    return errorResponse("Filtre invalide.", 400);
  }

  let query = admin
    .from("site_suggestions")
    .select(
      "id, category, message, status, created_at",
      { count: "exact" }
    );

  if (category !== "all") {
    query = query.eq("category", category);
  }

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const start = (page - 1) * PAGE_SIZE;

  const {
    data,
    error,
    count,
  } = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(start, start + PAGE_SIZE - 1);

  if (error) {
    console.error(
      "Admin suggestions: load failed",
      error.code
    );

    return errorResponse(
      "Nu s-au putut încărca sugestiile.",
      500
    );
  }

  const {
    count: newCount,
    error: countError,
  } = await admin
    .from("site_suggestions")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("status", "new");

  if (countError) {
    console.error(
      "Admin suggestions: count failed",
      countError.code
    );

    return errorResponse(
      "Nu s-au putut încărca statisticile.",
      500
    );
  }

  return NextResponse.json(
    {
      items: data ?? [],
      total: count ?? 0,
      newCount: newCount ?? 0,
      page,
      pageSize: PAGE_SIZE,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function PATCH(request: Request) {
  const context = await getAdminContext(request);

  if (context.response) {
    return context.response;
  }

  const admin = context.admin;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Date invalide.", 400);
  }

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return errorResponse("Date invalide.", 400);
  }

  const input = body as Record<string, unknown>;
  const id = input.id;
  const status = input.status;

  if (
    typeof id !== "number" ||
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    typeof status !== "string" ||
    !statuses.includes(status)
  ) {
    return errorResponse(
      "Identificator sau status invalid.",
      400
    );
  }

  const {
    data,
    error,
  } = await admin
    .from("site_suggestions")
    .update({ status })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "Admin suggestions: update failed",
      error.code
    );

    return errorResponse(
      "Statusul nu a putut fi actualizat.",
      500
    );
  }

  if (!data) {
    return errorResponse(
      "Sugestia nu a fost găsită.",
      404
    );
  }

  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
