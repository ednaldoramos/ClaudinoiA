import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabaseServer";



export async function DELETE(
  request: Request
){

  try{


    const body =
      await request.json();


    const id =
      body.id;



    if(!id){

      return NextResponse.json({

        error:"ID não informado"

      },{
        status:400
      });

    }





    const {

      error

    } = await supabaseServer

      .from("memories")

      .delete()

      .eq(
        "id",
        id
      );





    if(error){

      throw error;

    }





    return NextResponse.json({

      success:true

    });




  }catch(error:any){


    return NextResponse.json({

      error:error.message

    },{
      status:500
    });


  }


}