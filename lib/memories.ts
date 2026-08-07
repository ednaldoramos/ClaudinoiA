import { supabaseServer } from "@/lib/supabaseServer";


export async function saveMemory(
  userId: string,
  chave: string,
  valor: string
) {


  // Verifica se já existe essa memória

  const { data: existing } =
    await supabaseServer

      .from("memories")

      .select("id")

      .eq(
        "user_id",
        userId
      )

      .eq(
        "chave",
        chave
      )

      .single();



  // Se existir, atualiza

  if (existing) {


    const { data, error } =

      await supabaseServer

        .from("memories")

        .update({

          valor,

        })

        .eq(
          "id",
          existing.id
        )

        .select();



    if(error){

      console.error(
        "ERRO AO ATUALIZAR MEMÓRIA:",
        error
      );

    }


    return {
      data,
      error,
    };


  }



  // Se não existir, cria

  const { data, error } =

    await supabaseServer

      .from("memories")

      .insert([

        {

          user_id: userId,

          chave,

          valor,

        },

      ])

      .select();



  if(error){

    console.error(
      "ERRO AO CRIAR MEMÓRIA:",
      error
    );

  }



  return {
    data,
    error,
  };


}





export async function getMemories(
  userId:string
){

  const { data, error } =

    await supabaseServer

      .from("memories")

      .select("*")

      .eq(
        "user_id",
        userId
      );



  if(error){

    console.error(
      "ERRO AO BUSCAR MEMÓRIAS:",
      error
    );

  }



  return {
    data,
    error,
  };


}