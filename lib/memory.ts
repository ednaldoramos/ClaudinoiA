import { supabase } from "@/lib/supabase";


export type Memory = {
  id: number;
  user_id: string;
  chave: string;
  valor: string;
};



export async function getCurrentUser() {

  const {
    data
  } = await supabase.auth.getUser();


  return data.user;

}





export async function getMemories() {

  const user = await getCurrentUser();


  if (!user) {

    return [];

  }



  const {
    data,
    error
  } = await supabase

    .from("memories")

    .select("*")

    .eq(
      "user_id",
      user.id
    )

    .order(
      "id",
      {
        ascending: false
      }
    );



  if (error) {

    console.log(
      "ERRO BUSCAR MEMÓRIAS:",
      error
    );

    return [];

  }



  return data as Memory[];

}







export async function createMemory(
  chave:string,
  valor:string
) {


  const user = await getCurrentUser();



  if (!user) {

    return false;

  }



  const {
    error
  } = await supabase

    .from("memories")

    .insert({

      user_id:user.id,

      chave,

      valor

    });



  if (error) {

    console.log(
      "ERRO CRIAR MEMÓRIA:",
      error
    );

    return false;

  }



  return true;

}







export async function updateMemory(
  id:number,
  valor:string
) {


  const {
    error
  } = await supabase

    .from("memories")

    .update({

      valor

    })

    .eq(
      "id",
      id
    );



  if (error) {

    console.log(
      "ERRO ATUALIZAR MEMÓRIA:",
      error
    );

    return false;

  }



  return true;

}








export async function deleteMemory(
  id:number
) {


  const {
    error
  } = await supabase

    .from("memories")

    .delete()

    .eq(
      "id",
      id
    );



  if (error) {

    console.log(
      "ERRO EXCLUIR MEMÓRIA:",
      error
    );

    return false;

  }



  return true;

}