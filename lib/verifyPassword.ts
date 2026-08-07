import { supabase } from "@/lib/supabase";


export async function verifyPassword(

  email:string,

  password:string

){


  const {

    data,

    error

  } = await supabase.auth.signInWithPassword({


    email,

    password,


  });




  if(error){


    console.log(

      "ERRO VALIDANDO SENHA:",

      error.message

    );


    return false;


  }



  return !!data.user;


}