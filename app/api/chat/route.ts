import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabaseServer";
import { core } from "@/lib/core/ClaudinoCore";
import { getUserPlanServer } from "@/lib/plansServer";

import {
  checkMessageLimit,
  addMessageUsage,
} from "@/lib/usage";

const MENTOR_USER_ID =
  "004fed89-55e8-4bb6-bbde-2a3b23b5cd59";

function isMentor(
  userId: string | null | undefined
) {
  return userId === MENTOR_USER_ID;
}

function isConfirmation(message: string) {
  const text = message.toLowerCase().trim();

  return (
    text === "sim" ||
    text.includes("pode atualizar") ||
    text.includes("confirmo") ||
    text.includes("correto") ||
    text.includes("pode mudar")
  );
}

function isMemoryCorrection(message: string) {
  const text = message.toLowerCase().trim();

  return (
    text.includes("não é uma ferramenta") ||
    text.includes("nao é uma ferramenta") ||
    text.includes("não é ferramenta") ||
    text.includes("nao é ferramenta")
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message = body.message;
    const conversationId = body.conversationId;

    if (!message || !conversationId) {
      return NextResponse.json(
        {
          reply:
            "Mensagem ou conversa não informada.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      AUTENTICAÇÃO

      O usuário NÃO é mais confiado através
      do userId enviado pelo navegador.

      A API usa o token da sessão do Supabase.
    */

    const authorization =
      request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        {
          reply:
            "Sessão não encontrada. Faça login novamente.",
        },
        {
          status: 401,
        }
      );
    }

    const token = authorization.replace(
      /^Bearer\s+/i,
      ""
    );

    const {
      data: { user },
      error: userError,
    } =
      await supabaseServer.auth.getUser(token);

    if (userError || !user) {
      console.error(
        "Erro ao autenticar usuário:",
        userError
      );

      return NextResponse.json(
        {
          reply:
            "Sessão inválida. Faça login novamente.",
        },
        {
          status: 401,
        }
      );
    }

    /*
      ID REAL DO USUÁRIO AUTENTICADO
    */

    const userId = user.id;

    const mentor = isMentor(userId);

    console.log(
      "USUÁRIO AUTENTICADO:",
      user.email
    );

    console.log(
      "USER ID AUTENTICADO:",
      userId
    );

    console.log(
      "USUÁRIO É MENTOR:",
      mentor
    );

    /*
      CONTROLE DE PLANO

      Mentor:
      - acesso vitalício
      - mensagens ilimitadas
      - não consome uso
      - não depende de créditos

      Clientes:
      - continuam usando normalmente
        os limites dos seus planos.
    */

    if (!mentor) {
      const plan =
        await getUserPlanServer(userId);

      console.log(
        "PLANO DO USUÁRIO:",
        plan
      );

      if (plan) {
        const limit =
          plan.messages_limit;

        if (
          limit !== null &&
          limit > 0
        ) {
          const usage =
            await checkMessageLimit(
              userId,
              limit
            );

          if (!usage.allowed) {
            return NextResponse.json({
              reply:
                "Você atingiu o limite do plano " +
                plan.plan_name +
                ".\n\n" +
                "Mensagens usadas:\n" +
                usage.used +
                "/" +
                limit +
                "\n\n" +
                "Faça upgrade do seu plano para continuar usando o ClaudinoIA.",
            });
          }
        }
      }
    }

    /*
      CONFIRMAÇÃO DE MEMÓRIA
    */

    if (
      userId &&
      isConfirmation(message)
    ) {
      const confirmed =
        await core.security.confirmMemoryUpdate(
          userId
        );

      if (confirmed.success) {
        if (!mentor) {
          await addMessageUsage(
            userId
          );
        }

        return NextResponse.json({
          reply:
            "Pronto! Atualizei sua memória.\n\n" +
            confirmed.chave +
            ": " +
            confirmed.valor,
        });
      }
    }

    /*
      HISTÓRICO DA CONVERSA
    */

    const {
      data: history,
      error: historyError,
    } = await supabaseServer
      .from("messages")
      .select("role, content")
      .eq(
        "conversation_id",
        conversationId
      )
      .order("created_at", {
        ascending: true,
      });

    if (historyError) {
      throw historyError;
    }

    let memories: any[] = [];
    let memoryResult: any = null;

    if (userId) {
      /*
        BUSCA MEMÓRIAS ATUAIS
      */

      memories =
        await core.memory.getContext(
          userId
        );

      /*
        APRENDIZADO
      */

      memoryResult =
        await core.memory.learn(
          userId,
          message
        );

      /*
        CORREÇÃO EXPLÍCITA
      */

      if (
        memoryResult &&
        memoryResult.protected &&
        isMemoryCorrection(message)
      ) {
        const {
          data: ferramentaAtual,
        } = await supabaseServer
          .from("memories")
          .select("*")
          .eq(
            "user_id",
            userId
          )
          .eq(
            "chave",
            "ferramenta"
          )
          .maybeSingle();

        if (ferramentaAtual) {
          await supabaseServer
            .from("memories")
            .delete()
            .eq(
              "id",
              ferramentaAtual.id
            );
        }

        const correctionText =
          message.trim();

        await core.memory.saveMemory(
          userId,
          "correcao_mancebo",
          correctionText
        );

        if (!mentor) {
          await addMessageUsage(
            userId
          );
        }

        return NextResponse.json({
          reply:
            "Entendido. Corrigi minha memória: MANCEBO não deve ser tratado como ferramenta. Vou considerar essa correção nas próximas conversas.",
        });
      }

      /*
        OUTRAS ALTERAÇÕES DE MEMÓRIA
      */

      if (
        memoryResult &&
        memoryResult.protected
      ) {
        const memoriaAtual =
          memories.find(
            (item) =>
              item.chave ===
              memoryResult.chave
          );

        await core.security.createMemoryConfirmation(
          userId,
          memoryResult.chave,
          memoryResult.valor
        );

        return NextResponse.json({
          reply:
            "Ednaldo, encontrei uma alteração na sua memória.\n\n" +
            "Atualmente tenho registrado:\n\n" +
            (memoriaAtual?.valor ||
              "não informado") +
            "\n\n" +
            "Você informou:\n\n" +
            memoryResult.valor +
            "\n\n" +
            "Deseja atualizar essa informação?",
        });
      }
    }

    /*
      CONTEXTO DE MEMÓRIA
    */

    const memoryContext =
      memories
        .map(
          (memory) =>
            `${memory.chave}: ${memory.valor}`
        )
        .join("\n");

    /*
      IA
    */

    const aiResponse =
      await core.ai.chat({
        userId,
        conversationId,
        message,
        history,
        memoryContext,
      });

    /*
      CONSUMO DE USO

      Mentor nunca consome uso.

      Clientes continuam consumindo
      normalmente.
    */

    if (
      userId &&
      !mentor
    ) {
      await addMessageUsage(
        userId
      );
    }

    /*
      ATUALIZA CONVERSA
    */

    await supabaseServer
      .from("conversations")
      .update({
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        conversationId
      );

    return NextResponse.json({
      reply: aiResponse.reply,
    });
  } catch (error: any) {
    console.error(
      "Erro ClaudinoIA:",
      error
    );

    return NextResponse.json(
      {
        reply:
          "Erro da IA: " +
          (error?.message ||
            "Erro desconhecido."),
      },
      {
        status: 500,
      }
    );
  }
}
