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
      .toLowerCase()
      .trim();






    const memoria =

      data.memoryContext

      .split("\n")

      .filter(Boolean)

      .map(item => {


        const partes =
          item.split(":");


        return {

          chave:
          partes[0]
          ?.trim()
          .toLowerCase(),


          valor:
          partes
          .slice(1)
          .join(":")
          .trim()

        };


      });






    const buscarMemoria = (
      chave:string
    ) => {


      return memoria.find(

        item =>
        item.chave === chave

      )
      ?.valor;


    };









    const respostasDiretas = [


      {
        palavras:[
          "qual meu nome",
          "meu nome"
        ],

        chave:"nome"
      },


      {
        palavras:[
          "qual meu projeto",
          "meu projeto"
        ],

        chave:"projeto"
      },


      {
        palavras:[
          "qual meu sonho",
          "meu sonho"
        ],

        chave:"sonho"
      },


      {
        palavras:[
          "qual minha profissão",
          "minha profissao",
          "meu trabalho"
        ],

        chave:"profissao"
      }


    ];







    for(
      const item of respostasDiretas
    ){



      if(

        item.palavras.some(

          palavra =>
          pergunta.includes(palavra)

        )

      ){



        const valor =
          buscarMemoria(
            item.chave
          );



        return {


          reply:

          valor

          ?

          `Seu ${item.chave} é ${valor}.`

          :

          `Ainda não tenho essa informação salva.`


        };


      }


    }









    const nome =

      buscarMemoria("nome")

      ||

      "usuário";









    const historyLimitado =

      (data.history || [])

      .slice(-10);









    const messages = [



      {


        role:"system" as const,


        content:

`
Você é o ClaudinoIA.

Você é uma inteligência artificial profissional.

Nome do usuário:
${nome}


Memórias disponíveis:

${data.memoryContext}



REGRAS IMPORTANTES:

- Responda em português do Brasil.
- Use memórias apenas como contexto.
- Memória pode estar incompleta ou incorreta.
- Nunca transforme uma memória em uma afirmação sem confirmar.
- Se o usuário corrigir uma informação, a correção tem prioridade.
- Nunca invente informações sobre o usuário.
- Seja natural e inteligente.
- Ajude no desenvolvimento do projeto ClaudinoIA.
`

      },





      ...historyLimitado.map(

        item => ({

          role:item.role,

          content:item.content

        })

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

      ?.content

      ||

      "Não consegui responder."


    };


  }


}