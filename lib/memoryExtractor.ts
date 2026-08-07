import OpenAI from "openai";

import { saveMemory } from "@/lib/memories";


const openai = new OpenAI({

  apiKey: process.env.OPENAI_API_KEY,

});




export async function extractMemory(

  userId:string,

  message:string

){


  console.log(

    "EXTRACTOR RECEBEU:",

    message

  );





  const response =

    await openai.chat.completions.create({


      model:"gpt-4.1-mini",


      messages:[


        {


          role:"system",


          content:`

Você é o sistema de memória do ClaudinoIA.

Analise a mensagem do usuário.

Retorne SOMENTE JSON.


Formato obrigatório:


{
 "chave":"",
 "valor":"",
 "tipo":""
}



Memórias protegidas:

nome
profissao
empresa
projeto
sonho



REGRAS:


1 - Se for uma informação nova normal:

Exemplo:

"Eu uso Supabase"

Retorne:


{
 "chave":"ferramenta",
 "valor":"Supabase",
 "tipo":"normal"
}



2 - Se o usuário tentar alterar uma memória protegida:

Exemplo:

"Meu nome é Carlos"


Retorne:


{
 "chave":"nome",
 "valor":"Carlos",
 "tipo":"protegida"
}



Exemplo:

"Meu projeto é NovaIA"


Retorne:


{
 "chave":"projeto",
 "valor":"NovaIA",
 "tipo":"protegida"
}



3 - Se não existir informação para salvar:


{
 "chave":"",
 "valor":"",
 "tipo":""
}



Não explique nada.
Retorne somente JSON.


`

        },


        {


          role:"user",


          content:message


        }


      ]


    });





  const content =

    response.choices[0]

      ?.message

      ?.content;





  console.log(

    "RESPOSTA EXTRATOR:",

    content

  );





  if(!content){


    return null;


  }






  try{


    const memory =

      JSON.parse(content);





    if(

      !memory.chave ||

      !memory.valor

    ){


      return null;


    }





    if(

      memory.tipo === "protegida"

    ){



      console.log(

        "ALTERAÇÃO PROTEGIDA DETECTADA:",

        memory

      );




      return {


        protected:true,


        chave:memory.chave,


        valor:memory.valor,


        tipo:memory.tipo


      };


    }






    await saveMemory(

      userId,

      memory.chave,

      memory.valor

    );






    console.log(

      "MEMÓRIA APRENDIDA:",

      memory

    );





    return {


      protected:false,


      chave:memory.chave,


      valor:memory.valor,


      tipo:memory.tipo


    };





  }

  catch(error){


    console.log(

      "ERRO NO EXTRATOR:",

      error

    );


    return null;


  }



}