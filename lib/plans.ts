import { supabase } from "@/lib/supabase";



export type UserPlan = {
  plan_name: string;
  price: number;
  messages_limit: number;
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




  const {
    data,
    error,
  } = await supabase.rpc(
    "get_user_plan",
    {
      uid: user.id,
    }
  );



  if (error) {

    console.error(
      "Erro ao buscar plano:",
      error
    );

    throw error;

  }



  if (!data || data.length === 0) {

    return null;

  }



  return {
    plan_name:
      data[0].plan_name,

    price:
      Number(data[0].price),

    messages_limit:
      data[0].messages_limit,

    features:
      data[0].features ?? [],
  };

}