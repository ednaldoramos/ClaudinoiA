import {
  createConfirmation,
} from "@/lib/memoryConfirmations";


import {
  confirmMemory,
} from "@/lib/confirmMemory";



export class SecurityManager {


  async createMemoryConfirmation(
    userId: string,
    chave: string,
    valor: string
  ) {


    return await createConfirmation(
      userId,
      chave,
      valor
    );


  }





  async confirmMemoryUpdate(
    userId: string
  ) {


    return await confirmMemory(
      userId
    );


  }





  async verify() {


    return true;


  }


}