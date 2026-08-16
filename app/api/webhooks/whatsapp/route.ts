import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token &&
    VERIFY_TOKEN &&
    token === VERIFY_TOKEN
  ) {
    return new NextResponse(challenge);
  }

  return NextResponse.json(
    { error: "Token de verificação inválido" },
    { status: 403 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(
      "WhatsApp Webhook recebido:",
      JSON.stringify(body, null, 2)
    );

    if (body?.object !== "whatsapp_business_account") {
      return NextResponse.json(
        { error: "Evento não reconhecido" },
        { status: 400 }
      );
    }

    const entries = body?.entry ?? [];

    for (const entry of entries) {
      const changes = entry?.changes ?? [];

      for (const change of changes) {
        if (change?.field !== "messages") {
          continue;
        }

        const value = change?.value;

        const messages = value?.messages ?? [];

        for (const message of messages) {
          console.log(
            "Nova mensagem WhatsApp:",
            JSON.stringify(message, null, 2)
          );
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no webhook do WhatsApp:", error);

    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 }
    );
  }
}
