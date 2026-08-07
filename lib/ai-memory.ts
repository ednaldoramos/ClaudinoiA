import { getMemories, Memory } from "@/lib/memory";



export async function getUserMemoryContext() {


  const memories: Memory[] = await getMemories();



  if (!memories || memories.length === 0) {

    return "";

  }



  const context = memories
    .map((memory)=>{

      return `${memory.chave}: ${memory.valor}`;

    })
    .join("\n");




  return context;


}







export async function findMemory(
  chave:string
) {


  const memories = await getMemories();



  const memory = memories.find(
    (item)=>
      item.chave.toLowerCase() === chave.toLowerCase()
  );



  return memory || null;


}