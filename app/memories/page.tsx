"use client";

import { useEffect, useState } from "react";

import {
  getMemories,
  createMemory,
  updateMemory,
  deleteMemory,
  Memory
} from "@/lib/memory";


export default function MemoriesPage() {


  const [memories,setMemories] = useState<Memory[]>([]);

  const [loading,setLoading] = useState(true);


  const [editing,setEditing] = useState<number | null>(null);

  const [editValue,setEditValue] = useState("");



  const [newKey,setNewKey] = useState("");

  const [newValue,setNewValue] = useState("");





  async function load(){

    const data = await getMemories();

    setMemories(data);

    setLoading(false);

  }





  useEffect(()=>{

    load();

  },[]);







  function edit(memory:Memory){

    setEditing(memory.id);

    setEditValue(memory.valor);

  }








  async function save(id:number){

    await updateMemory(
      id,
      editValue
    );

    setEditing(null);

    load();

  }







  async function remove(id:number){

    await deleteMemory(id);

    load();

  }








  async function add(){


    if(!newKey || !newValue)
      return;



    await createMemory(
      newKey,
      newValue
    );


    setNewKey("");

    setNewValue("");


    load();


  }









  if(loading){

    return (

      <div className="p-10 text-white">

        Carregando memórias...

      </div>

    );

  }







  return (

    <main className="min-h-screen bg-zinc-950 text-white p-10">


      <h1 className="text-3xl font-bold mb-8">

        🧠 Central de Memórias

      </h1>





      <section className="bg-zinc-800 p-5 rounded-xl mb-8">


        <h2 className="text-xl mb-4">

          Nova memória

        </h2>



        <input

          className="w-full bg-zinc-700 p-3 rounded mb-3"

          placeholder="Chave"

          value={newKey}

          onChange={
            e=>setNewKey(e.target.value)
          }

        />



        <input

          className="w-full bg-zinc-700 p-3 rounded mb-3"

          placeholder="Valor"

          value={newValue}

          onChange={
            e=>setNewValue(e.target.value)
          }

        />



        <button

          onClick={add}

          className="bg-green-600 px-5 py-2 rounded"

        >

          ➕ Adicionar

        </button>


      </section>








      <section className="space-y-5">


      {

      memories.map(memory=>(


        <div

          key={memory.id}

          className="bg-zinc-800 rounded-xl p-5"

        >


          <div className="flex justify-between">


            <div>


              <h3 className="text-blue-400 font-bold">

                {memory.chave}

              </h3>




              {

              editing === memory.id ?


              (

                <input

                  className="bg-zinc-700 p-2 rounded mt-3"

                  value={editValue}

                  onChange={
                    e=>setEditValue(e.target.value)
                  }

                />

              )


              :


              (

                <p className="mt-3">

                  {memory.valor}

                </p>

              )


              }



            </div>






            <div className="flex gap-3">


            {

            editing === memory.id ?


            (

              <button

                onClick={()=>save(memory.id)}

                className="text-green-400"

              >

                💾

              </button>

            )


            :


            (

              <button

                onClick={()=>edit(memory)}

                className="text-blue-400"

              >

                ✏️

              </button>

            )

            }



              <button

                onClick={()=>remove(memory.id)}

                className="text-red-400"

              >

                🗑️

              </button>


            </div>



          </div>


        </div>


      ))

      }



      </section>


    </main>

  );


}