import { NextRequest, NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabaseServer";
import { core } from "@/lib/core/ClaudinoCore";
import { checkMessageLimit, addMessageUsage } from "@/lib/usage";

const VERIFY_TOKEN =
  process.env.WHATSAPP_VERIFY_TOKEN || "ClaudinoIA_Webhook_2026";

const GRAPH_API_VERSION = "v26.0";

const MENTOR_USER_ID =
  "004fed89-55e8-4bb6-bbde-2a3b23b5cd59";

function isMentor(userId: string) {
  return userId === MENTOR_USER_ID;
}

function getTextMessage(value: any) {
  const message = value?.messages?.[0];

  if (!message || message.type !== "text") {
    return null;
  }

  const text = message.text?.body;

  if (typeof text !== "string" || !text.trim()) {
    return null;
  }

  return {
    id: String(message.id || ""),
    from: String(message.from || ""),
    text: text.trim(),
  };
}

async function sendWhatsAppMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string
) {
  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: {
          preview_url: false,
          body: text,
        },
      }),
    }
  );

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      `Erro ao enviar mensagem pelo WhatsApp: ${JSON.stringify(result)}`
    );
  }

  return result;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === VERIFY_TOKEN &&
    challenge
  ) {
    return new NextResponse(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  return NextResponse.json(
    { error: "Token de verificação inválido." },
    { status: 403 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(
      "📱 WhatsApp Webhook recebido:",
      JSON.stringify(body, null, 2)
    );

    const entries = Array.isArray(body?.entry)
      ? body.entry
      : [];

    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes)
        ? entry.changes
        : [];

      for (const change of changes) {
        if (change?.field !== "messages") {
          continue;
        }

        const value = change?.value;
        const phoneNumberId =
          value?.metadata?.phone_number_id;

        const incoming = getTextMessage(value);

        if (!phoneNumberId || !incoming?.from || !incoming.text) {
          continue;
        }

        const { data: connection, error: connectionError } =
          await supabaseServer
            .from("whatsapp_connections")
            .select(
              "id, user_id, phone_number_id, access_token, status"
            )
            .eq("phone_number_id", phoneNumberId)
            .maybeSingle();

        if (connectionError) {
          throw connectionError;
        }

        if (!connection) {
          console.error(
            "WhatsApp: conexão não encontrada para phone_number_id:",
            phoneNumberId
          );
          continue;
        }

        if (!connection.user_id || !connection.access_token) {
          console.error(
            "WhatsApp: conexão sem usuário ou access token:",
            connection.id
          );
          continue;
        }

        const userId = connection.user_id;
        const mentor = isMentor(userId);

        if (!mentor) {
          const creditStatus =
            await checkMessageLimit(userId);

          if (!creditStatus.allowed) {
            await sendWhatsAppMessage(
              phoneNumberId,
              connection.access_token,
              incoming.from,
              "Seus créditos acabaram. Adicione créditos para continuar usando o ClaudinoIA."
            );
            continue;
          }

          const consumed = await addMessageUsage(userId);

          if (!consumed?.allowed) {
            await sendWhatsAppMessage(
              phoneNumberId,
              connection.access_token,
              incoming.from,
              "Seus créditos acabaram. Adicione créditos para continuar usando o ClaudinoIA."
            );
            continue;
          }
        }

        const conversationTitle =
          `WhatsApp - ${incoming.from}`;

        let { data: conversation, error: conversationError } =
          await supabaseServer
            .from("conversations")
            .select("id, user_id, title")
            .eq("user_id", userId)
            .eq("title", conversationTitle)
            .maybeSingle();

        if (conversationError) {
          throw conversationError;
        }

        if (!conversation) {
          const result = await supabaseServer
            .from("conversations")
            .insert({
              user_id: userId,
              title: conversationTitle,
            })
            .select("id, user_id, title")
            .single();

          conversation = result.data;
          conversationError = result.error;
        }

        if (conversationError || !conversation) {
          throw conversationError ||
            new Error("Não foi possível criar a conversa do WhatsApp.");
        }

        const { data: history, error: historyError } =
          await supabaseServer
            .from("messages")
            .select("role, content")
            .eq("conversation_id", conversation.id)
            .order("created_at", { ascending: true });

        if (historyError) {
          throw historyError;
        }

        await supabaseServer.from("messages").insert({
          conversation_id: conversation.id,
          role: "user",
          content: incoming.text,
        });

        const memories =
          await core.memory.getContext(userId);

        const memoryResult =
          await core.memory.learn(
            userId,
            incoming.text
          );

        if (memoryResult?.protected) {
          const memoriaAtual = memories.find(
            (item) => item.chave === memoryResult.chave
          );

          await core.security.createMemoryConfirmation(
            userId,
            memoryResult.chave,
            memoryResult.valor
          );

          const confirmationReply =
            "Encontrei uma alteração na sua memória.\n\n" +
            "Atualmente tenho registrado:\n\n" +
            (memoriaAtual?.valor || "não informado") +
            "\n\nVocê informou:\n\n" +
            memoryResult.valor +
            "\n\nDeseja atualizar essa informação?";

          await supabaseServer.from("messages").insert({
            conversation_id: conversation.id,
            role: "assistant",
            content: confirmationReply,
          });

          await sendWhatsAppMessage(
            phoneNumberId,
            connection.access_token,
            incoming.from,
            confirmationReply
          );

          continue;
        }

        const memoryContext = memories
          .map(
            (memory) =>
              `${memory.chave}: ${memory.valor}`
          )
          .join("\n");

        const aiResponse = await core.ai.chat({
          userId,
          conversationId: conversation.id,
          message: incoming.text,
          history: history || [],
          memoryContext,
        });

        const reply = aiResponse.reply;

        await supabaseServer.from("messages").insert({
          conversation_id: conversation.id,
          role: "assistant",
          content: reply,
        });

        await supabaseServer
          .from("conversations")
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq("id", conversation.id)
          .eq("user_id", userId);

        await sendWhatsAppMessage(
          phoneNumberId,
          connection.access_token,
          incoming.from,
          reply
        );

        console.log(
          "✅ WhatsApp processado com sucesso:",
          {
            userId,
            phoneNumberId,
            from: incoming.from,
            conversationId: conversation.id,
          }
        );
      }
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Erro ao processar webhook do WhatsApp:",
      error
    );

    return NextResponse.json(
      { error: "Erro ao processar webhook." },
      { status: 500 }
    );
  }
}
