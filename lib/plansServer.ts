import { supabaseServer } from "@/lib/supabaseServer";

const MENTOR_USER_ID =
  "004fed89-55e8-4bb6-bbde-2a3b23b5cd59";

export async function getUserPlanServer(
  userId: string
) {
  /*
    MENTOR / DONO DO CLAUDINOIA

    Acesso vitalício:
    - sem limite de mensagens
    - sem cobrança
    - todos os recursos
  */

  if (userId === MENTOR_USER_ID) {
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

  /*
    CLIENTES NORMAIS

    Mantém a lógica baseada em user_plans.
  */

  const {
    data: userPlan,
    error,
  } = await supabaseServer
    .from("user_plans")
    .select(`
      plan_id,
      plans (
        id,
        name,
        price,
        messages_limit,
        features
      )
    `)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error(
      "Erro ao buscar plano:",
      error
    );

    return null;
  }

  if (
    !userPlan ||
    !userPlan.plans
  ) {
    return null;
  }

  const plan: any =
    userPlan.plans;

  return {
    plan_name: plan.name,
    price: Number(plan.price),
    messages_limit: plan.messages_limit,
    features: plan.features ?? [],
  };
}