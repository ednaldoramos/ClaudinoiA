import { supabaseServer } from "@/lib/supabaseServer";

export async function checkMessageLimit(
  userId: string,
  _limit?: number | null
) {
  const { data, error } = await supabaseServer
    .from("client_credits")
    .select("credits")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const credits = data?.credits ?? 0;

  return {
    allowed: credits > 0,
    used: 0,
    remaining: credits,
    credits,
  };
}

export async function addMessageUsage(userId: string) {
  const { data, error } = await supabaseServer
    .rpc("consume_client_credit", {
      p_user_id: userId,
    });

  if (error) {
    console.error(
      "ERRO AO CONSUMIR CRÉDITO:",
      error
    );

    throw error;
  }

  const result = Array.isArray(data)
    ? data[0]
    : data;

  return {
    credits: result?.credits ?? 0,
    allowed: result?.allowed ?? false,
  };
}