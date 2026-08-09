import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabaseServer";

const ADMIN_EMAIL = "ednaldo3283@gmail.com";

export async function GET(request: Request) {
try {
const authorization = request.headers.get("authorization");

if (!authorization) {
  return NextResponse.json(
    {
      error: "NÃ£o autorizado.",
    },
    {
      status: 401,
    }
  );
}

const token = authorization.replace("Bearer ", "");

const {
  data: { user },
  error: userError,
} = await supabaseServer.auth.getUser(token);

if (userError || !user) {
  return NextResponse.json(
    {
      error: "SessÃ£o invÃ¡lida.",
    },
    {
      status: 401,
    }
  );
}

if (user.email !== ADMIN_EMAIL) {
  return NextResponse.json(
    {
      error: "Acesso administrativo negado.",
    },
    {
      status: 403,
    }
  );
}

const { data, error } =
  await supabaseServer.auth.admin.listUsers();

if (error) {
  throw error;
}

const { data: credits, error: creditsError } =
  await supabaseServer
    .from("user_credits")
    .select("user_id, credits");

if (creditsError) {
  throw creditsError;
}

const creditMap = new Map<string, number>();

for (const credit of credits ?? []) {
  creditMap.set(
    credit.user_id,
    Number(credit.credits ?? 0)
  );
}

const clients = (data?.users ?? [])
  .filter((item) => item.email !== ADMIN_EMAIL)
  .map((item) => ({
    id: item.id,

    email: item.email ?? "",

    name:
      item.user_metadata?.name ||
      item.user_metadata?.full_name ||
      item.email?.split("@")[0] ||
      "Cliente",

    credits: creditMap.get(item.id) ?? 0,
  }));

return NextResponse.json({
  clients,
});

} catch (error: any) {
console.error("Erro ao listar clientes:", error);

return NextResponse.json(
  {
    error:
      error?.message ||
      "Erro interno do servidor.",
  },
  {
    status: 500,
  }
);

}
}
