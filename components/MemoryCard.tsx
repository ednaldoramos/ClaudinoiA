"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";


type Memory = {
  id: number;
  chave: string;
  valor: string;
};



function getIcon(chave: string) {

  const key = chave.toLowerCase();


  if (key.includes("nome"))
    return "👤";


  if (
    key.includes("profissao") ||
    key.includes("profissão")
  )
    return "💼";


  if (key.includes("projeto"))
    return "🧠";


  if (key.includes("sonho"))
    return "🌟";


  if (
    key.includes("gosto") ||
    key.includes("prefer")
  )
    return "🎯";


  return "🧠";

}







function memoryOrder(chave:string) {


  const key =
    chave.toLowerCase();



  if(key.includes("nome"))
    return 1;



  if(
    key.includes("profissao") ||
    key.includes("profissão")
  )
    return 2;



  if(key.includes("projeto"))
    return 3;



  if(key.includes("sonho"))
    return 4;



  return 5;


}








export default function MemoryCard() {


  const [memories, setMemories] =
    useState<Memory[]>([]);



  const [loading, setLoading] =
    useState(true);



  const [chave, setChave] =
    useState("");



  const [valor, setValor] =
    useState("");










  async function loadMemories() {


    try {


      const { data:userData } =
        await supabase.auth.getUser();



      if(!userData.user){

        setLoading(false);

        return;

      }





      const { data,error } =

        await supabase

          .from("memories")

          .select("*")

          .eq(
            "user_id",
            userData.user.id
          );





      if(error){


        console.error(
          "ERRO AO CARREGAR MEMÓRIAS:",
          error
        );



      } else {



        const organized =

          (data || [])

          .sort(

            (a,b)=>

              memoryOrder(a.chave) -

              memoryOrder(b.chave)

          );



        setMemories(
          organized
        );


      }




    } catch(error){


      console.error(
        "ERRO:",
        error
      );



    } finally {


      setLoading(false);


    }


  }









  async function addMemory(){


    if(
      !chave.trim() ||
      !valor.trim()
    )
      return;





    const { data:userData } =
      await supabase.auth.getUser();





    if(!userData.user)
      return;







    const { data,error } =

      await supabase

        .from("memories")

        .insert([

          {

            user_id:
              userData.user.id,

            chave,

            valor

          }

        ])

        .select()

        .single();







    if(error){


      console.error(
        "ERRO AO SALVAR MEMÓRIA:",
        error
      );


      return;


    }







    if(data){



      setMemories(

        prev =>


        [

          ...prev,

          data

        ]

        .sort(

          (a,b)=>

            memoryOrder(a.chave) -

            memoryOrder(b.chave)

        )

      );




      setChave("");

      setValor("");



    }


  }









  useEffect(()=>{


    loadMemories();


  },[]);









  if(loading){


    return (

      <div className="bg-zinc-800 rounded-xl p-6">

        Carregando memória...

      </div>

    );


  }









  return (


    <div className="bg-zinc-800 rounded-xl p-6">



      <h2 className="text-2xl font-bold mb-5">

        🧠 Minha Memória

      </h2>







      <div className="bg-zinc-900 rounded-lg p-4 mb-5">



        <h3 className="font-bold mb-3">

          ➕ Adicionar memória

        </h3>







        <input


          value={chave}


          onChange={

            e =>

            setChave(
              e.target.value
            )

          }


          placeholder="Ex: sonho"

          className="bg-zinc-700 rounded p-2 w-full mb-3"


        />







        <input


          value={valor}


          onChange={

            e =>

            setValor(
              e.target.value
            )

          }


          placeholder="Ex: Criar uma grande empresa"


          className="bg-zinc-700 rounded p-2 w-full mb-3"


        />







        <button


          onClick={addMemory}


          className="bg-blue-600 rounded px-4 py-2"


        >

          Salvar memória

        </button>



      </div>









      <div className="grid gap-3">





        {memories.map((memory)=>(




          <div


            key={memory.id}


            className="bg-zinc-900 rounded-lg p-4 flex items-center gap-4"



          >




            <div className="text-3xl">


              {getIcon(memory.chave)}


            </div>







            <div>



              <p className="text-blue-400 font-bold capitalize">


                {memory.chave}


              </p>





              <p>


                {memory.valor}


              </p>




            </div>




          </div>




        ))}




      </div>





    </div>



  );


}