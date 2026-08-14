import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VERIFY_TOKEN =
  process.env.WHATSAPP_VERIFY_TOKEN || "ClaudinoIA_Webhook_2026";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json(
        { success: true },
        { status: 200 }
      );
    }

    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field !== "messages") {
          continue;
        }

        const value = change.value;

        const phoneNumberId =
          value?.metadata?.phone_number_id;

        const messages = value?.messages ?? [];

        if (!phoneNumberId || messages.length === 0) {
          continue;
        }

        const { data: connection, error } = await supabase
          .from("whatsapp_connections")
          .select(
            `
              id,
              user_id,
              phone_number_id,
              waba_id,
              phone_number,
              display_name,
              access_token,
              status
            `
          )
          .eq("phone_number_id", phoneNumberId)
          .maybeSingle();

        if (error) {
          console.error(
            "Erro ao buscar conexão WhatsApp:",
            error
          );

          continue;
        }

        if (!connection) {
          console.warn(
            "Nenhuma conexão encontrada para phone_number_id:",
            phoneNumberId
          );

          continue;
        }

        console.log(
          "✅ Conexão WhatsApp identificada:",
          {
            connectionId: connection.id,
            userId: connection.user_id,
            phoneNumberId: connection.phone_number_id,
            displayName: connection.display_name,
          }
        );

        for (const message of messages) {
          if (message.type !== "text") {
            console.log(
              "Mensagem não textual recebida:",
              message.type
            );

            continue;
          }

          const from = message.from;
          const text = message.text?.body;

          if (!from || !text) {
            continue;
          }

          console.log(
            "💬 Mensagem recebida:",
            {
              from,
              text,
              userId: connection.user_id,
              connectionId: connection.id,
            }
          );

          /*
           * Próxima etapa:
           * enviar esta mensagem para o ClaudinoIA
           * e responder pelo WhatsApp Cloud API.
           */
        }
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
