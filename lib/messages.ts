import { supabase } from "@/lib/supabase";



export async function createConversation() {


  const {

    data: { user },

  } = await supabase.auth.getUser();



  if (!user) {

    throw new Error(
      "Usuário não autenticado."
    );

  }



  const { data, error } = await supabase

    .from("conversations")

    .insert({

      user_id: user.id,

      title: "Nova conversa",

    })

    .select()

    .single();




  if (error) {

    throw error;

  }




  return data.id;


}







export async function saveMessage(

  content: string,

  conversationId: string,

  role: "user" | "assistant"

) {



  const {

    data: { user },

  } = await supabase.auth.getUser();





  if (!user) {

    throw new Error(
      "Usuário não autenticado."
    );

  }





  const { error } = await supabase

    .from("messages")

    .insert({

      user_id: user.id,

      content,

      conversation_id: conversationId,

      role,

    });





  if (error) {

    throw error;

  }



}








export async function getMessages(

  conversationId: string

) {



  const {

    data: { user },

  } = await supabase.auth.getUser();





  if (!user) {

    return [];

  }






  const {

    data,

    error,

  } = await supabase

    .from("messages")

    .select("*")

    .eq(

      "user_id",

      user.id

    )

    .eq(

      "conversation_id",

      conversationId

    )

    .order(

      "created_at",

      {

        ascending:true,

      }

    );







  if(error){

    throw error;

  }






  return data || [];

}