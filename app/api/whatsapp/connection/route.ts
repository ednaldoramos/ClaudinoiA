import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const token = authorization
      .replace("Bearer ", "")
      .trim();

    if (!token) {
      return NextResponse.json(
        { error: "Token de autenticação ausente." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Sessão de usuário inválida." },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("whatsapp_connections")
      .select(
        `
          id,
          user_id,
          phone_number_id,
          waba_id,
          business_id,
          phone_number,
          display_name,
          status,
          created_at,
          updated_at
        `
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(
        "Erro ao buscar conexão WhatsApp:",
        error
      );

      return NextResponse.json(
        {
          error: "Erro ao buscar conexão do WhatsApp.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      connection: data ?? null,
    });
  } catch (error) {
    console.error(
      "Erro inesperado ao buscar conexão WhatsApp:",
      error
    );

    return NextResponse.json(
      { error: "Erro interno ao buscar conexão." },
      { status: 500 }
    );
  }
}