import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabaseServer";
import { addUserCredits } from "@/lib/creditsServer";

const ADMIN_EMAIL = "ednaldo3283@gmail.com";

async function authenticateAdmin(request: Request) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization) {
    return {
      user: null,
      error: "Não autorizado.",
      status: 401,
    };
  }

  const token = authorization.replace(
    /^Bearer\s+/i,
    ""
  );

  const {
    data: { user },
    error,
  } = await supabaseServer.auth.getUser(token);

  if (error || !user) {
    return {
      user: null,
      error: "Sessão inválida.",
      status: 401,
    };
  }

  if (user.email !== ADMIN_EMAIL) {
    return {
      user: null,
      error: "Acesso administrativo negado.",
      status: 403,
    };
  }

  return {
    user,
    error: null,
    status: 200,
  };
}

export async function GET(request: Request) {
  try {
    const auth =
      await authenticateAdmin(request);

    if (!auth.user) {
      return NextResponse.json(
        {
          error: auth.error,
        },
        {
          status: auth.status,
        }
      );
    }

    const {
      data,
      error,
    } = await supabaseServer.auth.admin.listUsers();

    if (error) {
      throw error;
    }

    /*
      IMPORTANTE:
      A tabela correta do sistema é
      client_credits.
    */

    const {
      data: credits,
      error: creditsError,
    } = await supabaseServer
      .from("client_credits")
      .select("user_id, credits");

    if (creditsError) {
      throw creditsError;
    }

    const creditMap =
      new Map<string, number>();

    for (const credit of credits ?? []) {
      creditMap.set(
        credit.user_id,
        Number(credit.credits ?? 0)
      );
    }

    const clients =
      (data?.users ?? [])
        .filter(
          (item) =>
            item.email !== ADMIN_EMAIL
        )
        .map((item) => ({
          id: item.id,

          email:
            item.email ?? "",

          name:
            item.user_metadata?.name ||
            item.user_metadata?.full_name ||
            item.email?.split("@")[0] ||
            "Cliente",

          credits:
            creditMap.get(item.id) ?? 0,
        }));

    return NextResponse.json({
      clients,
    });
  } catch (error: any) {
    console.error(
      "Erro ao listar clientes:",
      error
    );

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

export async function POST(request: Request) {
  try {
    const auth =
      await authenticateAdmin(request);

    if (!auth.user) {
      return NextResponse.json(
        {
          error: auth.error,
        },
        {
          status: auth.status,
        }
      );
    }

    const body =
      await request.json();

    const targetUserId =
      body.userId;

    const amount =
      Number(body.amount);

    if (
      !targetUserId ||
      typeof targetUserId !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Cliente não informado.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(amount) ||
      amount === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Informe uma quantidade inteira diferente de zero.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Nunca permitir alteração do
      saldo do próprio administrador.
    */

    if (
      targetUserId === auth.user.id
    ) {
      return NextResponse.json(
        {
          error:
            "O saldo do Mentor não pode ser alterado por esta função.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Confirma que o usuário realmente
      existe no Auth.
    */

    const {
      data: targetData,
      error: targetError,
    } =
      await supabaseServer.auth.admin.getUserById(
        targetUserId
      );

    if (
      targetError ||
      !targetData.user
    ) {
      return NextResponse.json(
        {
          error:
            "Cliente não encontrado.",
        },
        {
          status: 404,
        }
      );
    }

    /*
      Não permitir alterar outro
      administrador por acidente.
    */

    if (
      targetData.user.email ===
      ADMIN_EMAIL
    ) {
      return NextResponse.json(
        {
          error:
            "Não é permitido alterar o saldo do administrador.",
        },
        {
          status: 403,
        }
      );
    }

    /*
      O RPC existente aceita valores
      positivos e negativos.

      Positivo = adicionar créditos.
      Negativo = retirar créditos.
    */

    const newCredits =
      await addUserCredits(
        targetUserId,
        amount
      );

    return NextResponse.json({
      success: true,
      userId: targetUserId,
      amount,
      credits: Number(
        newCredits ?? 0
      ),
    });
  } catch (error: any) {
    console.error(
      "Erro ao alterar créditos:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Erro ao alterar créditos.",
      },
      {
        status: 500,
      }
    );
  }
}
