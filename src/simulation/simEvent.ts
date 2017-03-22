




export class SimEvent<T extends ISimEventResult> implements ISimEvent{


    onHold: boolean;

    deliverAt:number;
    scheduledAt:number;
    cancelled:boolean;
    promise:Promise<T>
    type: string;
    message:string;
    id:number;
    isScheduled:boolean = false;
    static count:number = 0;
    result : T;
    name:string;
    isConcurrent : boolean = false;
    log : boolean = true;
    callback : Function;



    generator:any;
    currentResult:any;

    constructor(scheduledAt:number, deliverAt:number,type:string,message:string){

        if(deliverAt===null) deliverAt = Number.POSITIVE_INFINITY;
        
        this.scheduledAt = scheduledAt;
        this.deliverAt = scheduledAt+deliverAt;
        this.cancelled = false;
        this.type=type;
        this.message = message;
        this.id= SimEvent.count;
        this.name  = "event"+this.id;
        SimEvent.count ++;
        this.onHold = false;

        this.promise =  new Promise<T>((resolve,reject)=>{
                    this.listen((event:SimEvent<T>)=>{

                        resolve(event.result);
                })

      
           
    });

    }

   next() : NextResult<T>{
       let n = this.generator.next(this.currentResult);
       let nr = new NextResult<T>();
       nr.done = n.done;
       nr.value  = n.value;


       return nr;
   }

    deliver(){
        this.callback(this);
    }


    listen(callback:Function){
        this.callback = callback;
    }
 


}

export class NextResult<T extends ISimEventResult>{
    done:boolean;
    value : T;
}

    export interface ISimEventResult{
    }

    export interface ISimEvent{
        deliverAt:number;
        id:number;
        message:string;
        type: string;
        name:string;
        isConcurrent:boolean;
        isScheduled:boolean ;
        promise:Promise<ISimEventResult>;
        log : boolean;
        deliver:Function;
        onHold: boolean;
        generator:any;
        currentResult:any;
        next :() => NextResult<ISimEventResult>;
    } 