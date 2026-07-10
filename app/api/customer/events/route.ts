import { getClientOrder } from "@/lib/customer-auth";
import { db } from "@/lib/db";

export const dynamic="force-dynamic";
export async function GET(){
  const order=await getClientOrder();
  if(!order)return new Response("No autorizado",{status:401});
  const encoder=new TextEncoder();
  let last=order.updatedAt.getTime();let timer:ReturnType<typeof setInterval>;
  const stream=new ReadableStream({
    start(controller){
      controller.enqueue(encoder.encode("event: connected\ndata: ok\n\n"));
      timer=setInterval(async()=>{
        try{
          const current=await db.repairOrder.findUnique({where:{id:order.id},select:{updatedAt:true,_count:{select:{updates:true,messages:true,estimates:true}}}});
          if(!current){controller.close();clearInterval(timer);return;}
          const fingerprint=current.updatedAt.getTime()+current._count.updates+current._count.messages+current._count.estimates;
          if(fingerprint!==last){last=fingerprint;controller.enqueue(encoder.encode(`event: refresh\ndata: ${Date.now()}\n\n`));}
          else controller.enqueue(encoder.encode(`event: ping\ndata: ${Date.now()}\n\n`));
        }catch{controller.enqueue(encoder.encode("event: ping\ndata: retry\n\n"));}
      },3000);
    },
    cancel(){clearInterval(timer);}
  });
  return new Response(stream,{headers:{"Content-Type":"text/event-stream","Cache-Control":"no-cache, no-transform","Connection":"keep-alive","X-Accel-Buffering":"no"}});
}
