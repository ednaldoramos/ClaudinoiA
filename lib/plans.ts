import { supabase } from "@/lib/supabase";

const MENTOR_USER_ID = "004fed89-55e8-4bb6-bbde-2a3b23b5cd59";

export type UserPlan = {
  plan_name: string;
  price: number;
  messages_limit: number | null;
  features: string[];
};

export async function getUserPlan(): Promise<UserPlan | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return null;
  }

  if (user.id === MENTOR_USER_ID) {
    return {
      plan_name: "Mentor",
      price: 0,
      messages_limit: null,
      features: [
        "Acesso vitalício",
        "Mensagens ilimitadas",
        "Memória completa",
        "Histórico de conversas",
        "Todos os recursos",
      ],
    };
  }

  const { data, error } = await supabase.rpc(
    "get_user_plan",
    {
      uid: user.id,
    }
  );

  if (error) {
    console.error("Erro ao buscar plano:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    return null;
  }

  return {
    plan_name: data[0].plan_name,
    price: Number(data[0].price),
    messages_limit: data[0].messages_limit ?? null,
    features: data[0].features ?? [],
  };
}