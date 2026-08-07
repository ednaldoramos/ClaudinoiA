import { supabaseServer } from "@/lib/supabaseServer";


export type Memory = {
  id?: string;
  user_id: string;
  chave: string;
  valor: string;
  created_at?: string;
};



export class MemoryManager {



  async getUserMemories(
    userId: string
  ) {


    const { data, error } =
      await supabaseServer

        .from("memories")

        .select("*")

        .eq(
          "user_id",
          userId
        )

        .order(
          "created_at",
          {
            ascending: false,
          }
        );



    if(error){

      console.error(
        "Erro buscando memórias:",
        error
      );


      return [];

    }



    return data || [];

  }







  async getContext(
    userId:string
  ){


    return await this.getUserMemories(
      userId
    );


  }








  async learn(
    userId:string,
    message:string
  ){


    const text =
      message.toLowerCase();



    const patterns = [

      {
        chave:"nome",
        regex:/meu nome é (.+)/
      },

      {
        chave:"profissao",
        regex:/minha profissão é (.+)/
      },

      {
        chave:"projeto",
        regex:/meu projeto é (.+)/
      },

      {
        chave:"sonho",
        regex:/meu sonho é (.+)/
      }

    ];





    for(const item of patterns){


      const match =
        text.match(
          item.regex
        );



      if(match){


        return {

          protected:true,

          chave:item.chave,

          valor:match[1]

        };


      }


    }





    return null;


  }









  async saveMemory(
    userId:string,
    chave:string,
    valor:string
  ){



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

        .maybeSingle();







    if(existing){


      return await supabaseServer

        .from("memories")

        .update({

          valor,

        })

        .eq(
          "id",
          existing.id
        )

        .select()

        .single();


    }








    return await supabaseServer

      .from("memories")

      .insert({

        user_id:userId,

        chave,

        valor,

      })

      .select()

      .single();


  }









  formatMemoriesForAI(
    memories:Memory[]
  ){



    if(!memories.length){

      return "";

    }






    return memories

      .map(

        memory =>
          `${memory.chave}: ${memory.valor}`

      )

      .join("\n");



  }



}