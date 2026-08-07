import { supabaseServer } from "@/lib/supabaseServer";


export async function getUserPlanServer(
  userId: string
) {


  const { data: userPlan, error } =
    await supabaseServer
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
      .eq(
        "user_id",
        userId
      )
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



  const plan:any =
    userPlan.plans;



  return {

    plan_name:
      plan.name,


    price:
      Number(plan.price),


    messages_limit:
      plan.messages_limit,


    features:
      plan.features ?? [],

  };

}