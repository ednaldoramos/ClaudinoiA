"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

import Sidebar from "@/components/layout/Sidebar";
import ChatBox from "@/components/chat/ChatBox";
import ProfileCard from "@/components/ProfileCard";


export default function Dashboard() {


  const router = useRouter();


  const [
    conversationId,
    setConversationId
  ] = useState<string | null>(null);



  const [
    loading,
    setLoading
  ] = useState(true);





  useEffect(() => {


    async function checkUser() {


      const {
        data
      } = await supabase.auth.getUser();



      if (!data.user) {

        router.push("/");

        return;

      }



      setLoading(false);


    }



    checkUser();


  }, [router]);







  if (loading) {


    return (

      <main className="
        min-h-screen
        bg-zinc-950
        text-white
        flex
        items-center
        justify-center
      ">


        <div className="text-center">


          <h1 className="
            text-4xl
            font-bold
            text-white
          ">

            🤖 ClaudinoIA

          </h1>


          <p className="
            text-zinc-400
            mt-3
          ">

            Carregando...

          </p>


        </div>


      </main>

    );


  }








  return (

    <main className="
      min-h-screen
      bg-zinc-950
      text-white
      flex
    ">



      <Sidebar

        onSelectConversation={

          setConversationId

        }

      />







      <section className="
        flex-1
        p-8
        overflow-y-auto
      ">




        <div className="
          max-w-6xl
          mx-auto
        ">



          <header className="
            mb-8
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            p-6
          ">


            <h1 className="
              text-4xl
              font-bold
              text-white
            ">

              🤖 ClaudinoIA Dashboard

            </h1>




            <p className="
              text-zinc-400
              mt-3
            ">

              Sua central de inteligência artificial.

            </p>



          </header>








          <ProfileCard />









          <div className="mt-10">



            {

              conversationId ? (


                <ChatBox

                  conversationId={

                    conversationId

                  }

                />


              ) : (


                <div className="
                  bg-zinc-900
                  border
                  border-zinc-800
                  rounded-2xl
                  p-10
                  text-center
                ">



                  <h2 className="
                    text-2xl
                    font-semibold
                    text-white
                  ">

                    👋 Bem-vindo ao ClaudinoIA

                  </h2>





                  <p className="
                    text-zinc-400
                    mt-4
                  ">

                    Escolha uma conversa ou crie uma nova para começar.

                  </p>



                </div>


              )

            }



          </div>






        </div>





      </section>





    </main>


  );


}