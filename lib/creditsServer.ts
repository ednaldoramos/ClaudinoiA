import { supabaseServer } from "@/lib/supabaseServer";

export async function getUserCredits(
  userId: string
) {
  const { data, error } = await supabaseServer
    .from("client_credits")
    .select("credits")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.credits ?? 0;
}

export async function addUserCredits(
  userId: string,
  amount: number
) {
  if (!Number.isInteger(amount)) {
    throw new Error(
      "A quantidade de créditos deve ser um número inteiro."
    );
  }

  if (amount === 0) {
    throw new Error(
      "A quantidade de créditos não pode ser zero."
    );
  }

  const { data, error } = await supabaseServer.rpc(
    "add_client_credits",
    {
      target_user_id: userId,
      amount,
    }
  );

  if (error) {
    throw error;
  }

  return data ?? 0;
}