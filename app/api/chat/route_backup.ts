import { NextResponse } from "next/server";
import OpenAI from "openai";

import { supabaseServer } from "@/lib/supabaseServer";

import {
  getMemories,
} from "@/lib/memories";

import {
  extractMemory,
} from "@/lib/memoryExtractor";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export async function POST(request: Request) {

  try {

    const body = await request.json();


    const message = body.message;
    const conversationId = body.conversationId;
    const userId = body.userId;


    console.log(
      "USER ID RECEBIDO NA API:",
      userId
    );



    if (!message || !conversationId) {

      return NextResponse.json({

        reply:
          "Mensagem ou conversa não informada.",

      });

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



    if(userId){

      const result =
        await getMemories(
          userId
        );


      memories =
        result.data || [];


      console.log(
        "MEMÓRIAS:",
        memories
      );



      // NOVA MEMÓRIA AUTOMÁTICA

      await extractMemory(
        userId,
        message
      );


    }





    const messages = [


      {

        role:
          "system" as const,


        content:

`
Você é o ClaudinoIA.

Você é um assistente inteligente,
amigável e profissional.

Use sempre as memórias do usuário.

Memórias:

${JSON.stringify(memories)}


Histórico:

${JSON.stringify(history)}

`,

      },



      ...(history || []).map(
        (item)=>({

          role:
            item.role as
            "user" |
            "assistant",

          content:
            item.content,

        })
      ),



      {

        role:
          "user" as const,

        content:
          message,

      },

    ];







    const completion =

      await openai.chat.completions.create({

        model:
          "gpt-4.1-mini",

        messages,

      });





    const reply =

      completion
        .choices[0]
        ?.message
        ?.content ||

      "Não consegui responder.";







    return NextResponse.json({

      reply,

    });





  } catch(error:any){


    console.error(
      "Erro ClaudinoIA:",
      error
    );



    return NextResponse.json({

      reply:
        `Erro da IA: ${error.message}`,

    },
    {
      status:500,
    });


  }


}