import { MemoryManager } from "./MemoryManager";
import { SecurityManager } from "./SecurityManager";
import { AIManager } from "./AIManager";


export class ClaudinoCore {


  public memory: MemoryManager;

  public security: SecurityManager;

  public ai: AIManager;



  constructor() {


    this.memory = new MemoryManager();

    this.security = new SecurityManager();

    this.ai = new AIManager();


  }





  async chat(data:any){


    const security =

      await this.security.verify();



    if(!security){


      return {

        reply:

        "Acesso bloqueado."

      };


    }





    return await this.ai.chat(data);



  }



}



export const core = new ClaudinoCore();