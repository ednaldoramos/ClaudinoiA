import {
  getMemories,
  saveMemory,
} from "@/lib/memories";


import {
  extractMemory,
} from "@/lib/memoryExtractor";





export class MemoryManager {



  async getContext(
    userId: string
  ) {



    const result =

      await getMemories(
        userId
      );



    return result.data || [];



  }









  async learn(

    userId: string,

    message: string

  ) {



    const memory =

      await extractMemory(

        userId,

        message

      );





    if(

      memory &&

      memory.chave &&

      memory.valor

    ) {



      await saveMemory(

        userId,

        memory.chave,

        memory.valor

      );



    }





    return memory;



  }



}