import { supabaseServer } from "@/lib/supabaseServer";



export async function createConfirmation(

  userId: string,

  chave: string,

  valorNovo: string

) {


  const { data, error } =

    await supabaseServer

      .from("memory_confirmations")

      .insert([

        {

          user_id: userId,

          chave,

          valor_novo: valorNovo,

          status: "pendente",

        },

      ])

      .select()

      .single();





  if(error){

    console.error(

      "ERRO AO CRIAR CONFIRMAÇÃO:",

      error

    );

  }





  return {

    data,

    error,

  };


}







export async function getPendingConfirmation(

  userId:string

){


  const { data, error } =

    await supabaseServer

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

          ascending:false,

        }

      )

      .limit(1)

      .single();





  return {

    data,

    error,

  };


}







export async function deleteConfirmation(

  id:number

){


  const { error } =

    await supabaseServer

      .from("memory_confirmations")

      .delete()

      .eq(

        "id",

        id

      );





  return {

    error,

  };


}