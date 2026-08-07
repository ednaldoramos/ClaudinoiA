"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  getMessages,
  saveMessage,
} from "@/lib/messages";


type Message = {
  role: "user" | "assistant";
  content: string;
};


type ChatBoxProps = {
  conversationId: string;
};


export default function ChatBox({
  conversationId,
}: ChatBoxProps) {


  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  const [userId, setUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);



  async function loadMessages() {

    try {

      const data =
        await getMessages(
          conversationId
        );


      setMessages(
        data.map((item:any)=>({

          role:item.role,

          content:item.content,

        }))
      );


    } catch(error) {

      console.error(
        "Erro mensagens:",
        error
      );

    }

  }




  useEffect(()=>{


    async function loadUser(){


      const { data } =
        await supabase.auth.getUser();



      if(data.user){


        setUserId(
          data.user.id
        );


        console.log(
          "USUÁRIO:",
          data.user
        );


      }


    }



    loadUser();

    loadMessages();



  },[conversationId]);





  async function sendMessage(){


    if(!message.trim()) return;



    const userText = message;



    setMessages((prev)=>[

      ...prev,

      {
        role:"user",
        content:userText,
      }

    ]);



    setMessage("");

    setLoading(true);




    try {


      await saveMessage(
        userText,
        conversationId,
        "user"
      );



      const response =
        await fetch(
          "/api/chat",
          {

            method:"POST",

            headers:{

              "Content-Type":
              "application/json",

            },


            body:JSON.stringify({

              message:userText,

              conversationId,

              userId,

            }),

          }
        );



      const data =
        await response.json();



      if(!response.ok){

        throw new Error(
          data.reply ||
          "Erro na API"
        );

      }



      const aiReply =
        data.reply ||
        "Sem resposta";



      setMessages((prev)=>[

        ...prev,

        {

          role:"assistant",

          content:aiReply,

        }

      ]);



      await saveMessage(

        aiReply,

        conversationId,

        "assistant"

      );


    } catch(error:any) {


      console.error(
        "ERRO CHAT:",
        error
      );


      setMessages((prev)=>[

        ...prev,

        {

          role:"assistant",

          content:
          "Erro ao conectar com o ClaudinoIA: "
          + error.message,

        }

      ]);


    } finally {

      setLoading(false);

    }


  }  return (

    <div className="bg-zinc-800 rounded-xl p-6">


      <h2 className="text-2xl font-bold mb-5">

        🤖 Bate-papo ClaudinoIA

      </h2>




      <div className="bg-zinc-900 rounded-lg p-4 min-h-[350px] mb-5">


        {
          messages.length === 0 && (

            <p className="text-zinc-400">

              Comece uma conversa...

            </p>

          )
        }





        {
          messages.map((msg,index)=>(


            <div

              key={index}

              className="mb-4"

            >



              {
                msg.role === "user" ? (


                  <p>

                    👤 <strong>Você:</strong>{" "}

                    {msg.content}

                  </p>



                ) : (


                  <p className="text-blue-400">

                    🤖 <strong>ClaudinoIA:</strong>{" "}

                    {msg.content}

                  </p>


                )
              }



            </div>


          ))
        }






        {
          loading && (

            <p className="text-zinc-400">

              🤖 ClaudinoIA pensando...

            </p>

          )
        }



      </div>






      <Textarea

        value={message}

        onChange={(e)=>

          setMessage(
            e.target.value
          )

        }

        placeholder="Digite sua mensagem..."

        className="mb-4"

      />







      <Button

        onClick={sendMessage}

      >

        Enviar mensagem

      </Button>




    </div>

  );


}