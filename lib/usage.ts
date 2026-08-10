import { supabaseServer } from "@/lib/supabaseServer";

export async function checkMessageLimit(
  userId: string,
  limit?: number | null
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
  const { data: current, error: readError } =
    await supabaseServer
      .from("client_credits")
      .select("credits")
      .eq("user_id", userId)
      .maybeSingle();

  if (readError) {
    throw readError;
  }

  const currentCredits = current?.credits ?? 0;

  if (currentCredits <= 0) {
    return {
      credits: 0,
      allowed: false,
    };
  }

  const newCredits = currentCredits - 1;

  const { data, error } = await supabaseServer
    .from("client_credits")
    .update({
      credits: newCredits,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select("credits")
    .single();

  if (error) {
    throw error;
  }

  return {
    credits: data.credits,
    allowed: true,
  };
}