import { supabaseServer } from "@/lib/supabaseServer";
import { saveMemory } from "@/lib/memories";
import { deleteConfirmation } from "@/lib/memoryConfirmations";



export async function confirmMemory(

  userId:string

){


  const {

    data:confirmation,

    error

  } = await supabaseServer

    .from("memory_confirmations")

    .select("*")

    .eq(

      "user_id",

      userId

    )

    .eq(

      "status",

      "pendente"

    )

    .order(

      "created_at",

      {

        ascending:false

      }

    )

    .limit(1)

    .single();





  if(error || !confirmation){


    return {

      success:false,

      message:"Nenhuma alteração pendente."

    };


  }







  await saveMemory(

    userId,

    confirmation.chave,

    confirmation.valor_novo

  );







  await deleteConfirmation(

    confirmation.id

  );







  return {


    success:true,


    chave:confirmation.chave,


    valor:confirmation.valor_novo


  };



}