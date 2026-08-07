import { supabase } from "@/lib/supabase";


export async function createConversation(
  title = "Nova conversa"
) {

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();


  if (userError) {
    console.error(
      "Erro ao buscar usuário:",
      userError
    );
    throw userError;
  }


  if (!user) {
    throw new Error(
      "Usuário não autenticado."
    );
  }


  const {
    data,
    error,
  } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      title,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();


  if (error) {
    console.error(
      "Erro ao criar conversa:",
      error
    );

    throw error;
  }


  console.log(
    "CONVERSA CRIADA:",
    data
  );


  return data;
}





export async function getConversations() {


  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();



  if (userError) {

    console.error(
      "Erro ao pegar usuário:",
      userError
    );

    return [];

  }




  if (!user) {

    console.log(
      "Nenhum usuário logado"
    );

    return [];

  }





  const {
    data,
    error,
  } = await supabase
    .from("conversations")
    .select("*")
    .eq(
      "user_id",
      user.id
    )
    .order(
      "updated_at",
      {
        ascending: false,
      }
    );





  if (error) {

    console.error(
      "Erro ao buscar conversas:",
      error
    );

    throw error;

  }





  console.log(
    "CONVERSAS ENCONTRADAS:",
    data
  );



  return data || [];

}







export async function updateConversation(
  id: string
) {


  const {
    error,
  } = await supabase
    .from("conversations")
    .update({
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      id
    );



  if (error) {

    console.error(
      "Erro ao atualizar conversa:",
      error
    );

    throw error;

  }


}







export async function deleteConversation(
  id: string
) {


  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();



  if (userError) {

    throw userError;

  }



  if (!user) {

    throw new Error(
      "Usuário não autenticado."
    );

  }




  const {
    error,
  } = await supabase
    .from("conversations")
    .delete()
    .eq(
      "id",
      id
    )
    .eq(
      "user_id",
      user.id
    );



  if (error) {

    console.error(
      "Erro ao deletar conversa:",
      error
    );

    throw error;

  }


}