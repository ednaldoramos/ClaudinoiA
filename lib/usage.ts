import { supabaseServer } from "@/lib/supabaseServer";


export async function checkMessageLimit(
  userId: string,
  limit: number
) {

  const month =
    new Date()
      .toISOString()
      .slice(0, 7);



  const { data, error } =
    await supabaseServer
      .from("message_usage")
      .select("used_messages")
      .eq(
        "user_id",
        userId
      )
      .eq(
        "month",
        month
      )
      .maybeSingle();



  if (error) {
    throw error;
  }



  const used =
    data?.used_messages ?? 0;



  return {
    allowed: used < limit,
    used,
    remaining:
      Math.max(
        limit - used,
        0
      ),
  };

}




export async function addMessageUsage(
  userId: string
) {

  const { data, error } =
    await supabaseServer.rpc(
      "increment_message_usage",
      {
        uid: userId,
      }
    );



  if (error) {
    throw error;
  }



  return data;

}