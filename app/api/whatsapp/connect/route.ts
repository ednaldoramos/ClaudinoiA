import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const token = authorization.replace("Bearer ", "").trim();

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

    const body = await request.json();

    const {
      phone_number_id,
      waba_id,
      business_id,
      phone_number,
      display_name,
      access_token,
      status = "connected",
    } = body;

    const { data: existingConnection, error: existingError } =
      await supabase
        .from("whatsapp_connections")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (existingError) {
      console.error(
        "Erro ao verificar conexão existente:",
        existingError
      );

      return NextResponse.json(
        { error: "Erro ao verificar conexão do WhatsApp." },
        { status: 500 }
      );
    }

    let data;
    let error;

    if (existingConnection) {
      const result = await supabase
        .from("whatsapp_connections")
        .update({
          phone_number_id: phone_number_id ?? null,
          waba_id: waba_id ?? null,
          business_id: business_id ?? null,
          phone_number: phone_number ?? null,
          display_name: display_name ?? null,
          access_token: access_token ?? null,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingConnection.id)
        .eq("user_id", user.id)
        .select()
        .single();

      data = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from("whatsapp_connections")
        .insert({
          user_id: user.id,
          phone_number_id: phone_number_id ?? null,
          waba_id: waba_id ?? null,
          business_id: business_id ?? null,
          phone_number: phone_number ?? null,
          display_name: display_name ?? null,
          access_token: access_token ?? null,
          status,
        })
        .select()
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error(
        "Erro ao salvar conexão WhatsApp:",
        error
      );

      return NextResponse.json(
        {
          error: "Não foi possível salvar a conexão do WhatsApp.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Conexão do WhatsApp salva com sucesso.",
      connection: {
        id: data.id,
        user_id: data.user_id,
        phone_number_id: data.phone_number_id,
        waba_id: data.waba_id,
        business_id: data.business_id,
        phone_number: data.phone_number,
        display_name: data.display_name,
        status: data.status,
      },
    });
  } catch (error) {
    console.error(
      "Erro inesperado na conexão do WhatsApp:",
      error
    );

    return NextResponse.json(
      { error: "Erro interno ao conectar o WhatsApp." },
      { status: 500 }
    );
  }
}