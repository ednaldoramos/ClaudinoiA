import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabaseServer";

import { core } from "@/lib/core/ClaudinoCore";

import { getUserPlanServer } from "@/lib/plansServer";

import {
  checkMessageLimit,
  addMessageUsage,
} from "@/lib/usage";


function isConfirmation(message: string) {

  const text =
    message
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


function isMemoryCorrection(message: string) {

  const text =
    message
      .toLowerCase()
      .trim();

  return (
    text.includes("não é uma ferramenta") ||
    text.includes("nao é uma ferramenta") ||
    text.includes("não é ferramenta") ||
    text.includes("nao é ferramenta")
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



    if (
      !message ||
      !conversationId
    ) {

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





    /*
      CONFIRMAÇÃO DE MEMÓRIA
    */

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






    /*
      HISTÓRICO DA CONVERSA
    */

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
          ascending: true,
        }
      );



    if (historyError) {

      throw historyError;

    }







    let memories: any[] = [];

    let memoryResult: any = null;







    if (userId) {



      /*
        BUSCA MEMÓRIAS ATUAIS
      */

      memories =
        await core.memory.getContext(
          userId
        );




      /*
        APRENDIZADO
      */

      memoryResult =
        await core.memory.learn(
          userId,
          message
        );







      /*
        CORREÇÃO EXPLÍCITA
      */

      if (
        memoryResult &&
        memoryResult.protected &&
        isMemoryCorrection(message)
      ) {


        /*
          O usuário está corrigindo uma
          informação anterior.

          Não vamos permitir que a
          memória antiga continue sendo
          interpretada como verdade.
        */


        const { data: ferramentaAtual } =

          await supabaseServer

            .from("memories")

            .select("*")

            .eq(
              "user_id",
              userId
            )

            .eq(
              "chave",
              "ferramenta"
            )
            .maybeSingle();





        /*
          Remove a memória antiga que
          estava causando o problema.
        */

        if (ferramentaAtual) {


          await supabaseServer

            .from("memories")

            .delete()

            .eq(
              "id",
              ferramentaAtual.id
            );


        }






        /*
          Salva a correção como memória
          permanente.
        */

        const correctionText =
          message.trim();


        await core.memory.saveMemory(

          userId,

          "correcao_mancebo",

          correctionText

        );






        await addMessageUsage(
          userId
        );




        return NextResponse.json({

          reply:
            "Entendido. Corrigi minha memória: MANCEBO não deve ser tratado como ferramenta. Vou considerar essa correção nas próximas conversas."

        });


      }







      /*
        OUTRAS ALTERAÇÕES DE MEMÓRIA
      */

      if (
        memoryResult &&
        memoryResult.protected
      ) {


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








    /*
      CONTEXTO DE MEMÓRIA
    */

    const memoryContext = memories

      .map(

        memory =>
          `${memory.chave}: ${memory.valor}`

      )

      .join("\n");







    /*
      IA
    */

    const aiResponse =

      await core.ai.chat({

        userId,

        conversationId,

        message,

        history,

        memoryContext,

      });







    if (userId) {

      await addMessageUsage(
        userId
      );

    }







    /*
      ATUALIZA CONVERSA
    */

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


  }

  catch (error: any) {


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

        status: 500,

      }

    );


  }

}