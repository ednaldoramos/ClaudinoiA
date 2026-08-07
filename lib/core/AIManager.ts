import OpenAI from "openai";


const openai = new OpenAI({

  apiKey: process.env.OPENAI_API_KEY,

});



export class AIManager {


  async chat(data: {

    userId: string;

    conversationId: string;

    message: string;

    history: any[];

    memoryContext: string;

  }) {



    console.log(

      "AIManager recebeu:",

      data

    );





    const pergunta =

      data.message

        .toLowerCase();







    const nomeMemoria =

      data.memoryContext

        .split("\n")

        .find((item)=>

          item.startsWith("nome:")

        )

        ?.replace(

          "nome:",

          ""

        )

        .trim();







    if(

      pergunta.includes("qual meu nome") ||

      pergunta.includes("qual é o meu nome")

    ){


      return {


        reply:

        `Seu nome é ${nomeMemoria || "não informado"}.`


      };


    }








    const nome =

      nomeMemoria || "usuário";






    // Limita histórico para evitar excesso de contexto

    const historyLimitado =

      (data.history || [])

        .slice(-10);







    const messages = [



      {


        role:"system" as const,


        content:

`
Você é o ClaudinoIA.

Você é um assistente inteligente,
profissional e amigável.

O nome do usuário é ${nome}.

Memórias importantes:

${data.memoryContext}



Regras:

- Responda em português do Brasil.
- Seja natural.
- Não invente informações.
- Use as memórias quando necessário.
- Ajude o usuário com o projeto ClaudinoIA.
`

      },







      ...historyLimitado.map(

        (item)=>(


          {


            role:item.role,


            content:item.content


          }


        )


      ),







      {


        role:"user" as const,


        content:data.message


      }



    ];









    const completion =

      await openai.chat.completions.create({



        model:"gpt-4.1-mini",



        messages,



      });









    return {


      reply:


        completion

        .choices[0]

        ?.message

        ?.content ||



        "Não consegui responder."


    };




  }



}