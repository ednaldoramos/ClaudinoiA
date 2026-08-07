import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabaseServer";

import { core } from "@/lib/core/ClaudinoCore";

import { getUserPlanServer } from "@/lib/plansServer";

import {
  checkMessageLimit,
  addMessageUsage,
} from "@/lib/usage";


function isConfirmation(message: string) {

  const text = message
    .toLowerCase()
    .trim();


  return (
    text === "sim" ||
    text.includes("pode atualizar") ||
    text.includes("confirmo") ||
    text.includes("correto") ||
    text.includes("pode mudar")
  );

}



export async function POST(
  request: Request
) {

  try {


    const body =
      await request.json();


    const message =
      body.message;


    const conversationId =
      body.conversationId;


    const userId =
      body.userId;



    console.log(
      "USER ID RECEBIDO NA API:",
      userId
    );



    if (!message || !conversationId) {

      return NextResponse.json(
        {
          reply:
            "Mensagem ou conversa não informada.",
        },
        {
          status: 400,
        }
      );

    }





    /*
      CONTROLE DE PLANO
    */

    if (userId) {


      const plan =
        await getUserPlanServer(
          userId
        );



      if (plan) {


        const limit =
          plan.messages_limit;



        if (limit > 0) {


          const usage =
            await checkMessageLimit(
              userId,
              limit
            );



          if (!usage.allowed) {


            return NextResponse.json({

              reply:
`🚀 Você atingiu o limite do plano ${plan.plan_name}.

Mensagens usadas:
${usage.used}/${limit}

Faça upgrade do seu plano para continuar usando o ClaudinoIA.`

            });


          }


        }


      }


    }





    if (
      userId &&
      isConfirmation(message)
    ) {


      const confirmed =
        await core.security.confirmMemoryUpdate(
          userId
        );


      if (confirmed.success) {


        await addMessageUsage(
          userId
        );


        return NextResponse.json({

          reply:
`Pronto! Atualizei sua memória.

${confirmed.chave}: ${confirmed.valor}`

        });


      }

    }







    const {
      data: history,
      error: historyError,

    } = await supabaseServer

      .from("messages")

      .select(
        "role, content"
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



    if(historyError){

      throw historyError;

    }







    let memories:any[] = [];

    let memoryResult:any = null;





    if(userId){



      memories =
        await core.memory.getContext(
          userId
        );



      memoryResult =
        await core.memory.learn(
          userId,
          message
        );





      if(
        memoryResult &&
        memoryResult.protected
      ){



        const memoriaAtual =
          memories.find(
            item =>
            item.chave ===
            memoryResult.chave
          );



        await core.security.createMemoryConfirmation(

          userId,

          memoryResult.chave,

          memoryResult.valor

        );




        return NextResponse.json({

          reply:
`Ednaldo, encontrei uma alteração na sua memória.

Atualmente tenho registrado:

${memoriaAtual?.valor || "não informado"}

Você informou:

${memoryResult.valor}

Deseja atualizar essa informação?`

        });



      }



    }







    const memoryContext = memories

      .map(

        memory =>
        `${memory.chave}: ${memory.valor}`

      )

      .join("\n");







    const aiResponse =

      await core.ai.chat({

        userId,

        conversationId,

        message,

        history,

        memoryContext,

      });








    if(userId){

      await addMessageUsage(
        userId
      );

    }








    await supabaseServer

      .from("conversations")

      .update({

        updated_at:
        new Date()
        .toISOString(),

      })

      .eq(
        "id",
        conversationId
      );







    return NextResponse.json({

      reply:
      aiResponse.reply,

    });






  } catch(error:any){



    console.error(
      "Erro ClaudinoIA:",
      error
    );



    return NextResponse.json(

      {

        reply:
        `Erro da IA: ${error.message}`,

      },

      {

        status:500,

      }

    );


  }


}