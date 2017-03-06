




export class SimEvent{



    deliverAt:number;
    scheduledAt:number;
    cancelled:boolean;
    promise:Promise<any>
    type: string;
    message:string;
    id:number;
    isScheduled:boolean = false;
    callbacks:Function[]
    static count:number = 0;
    result : any;
    name:string;


    constructor(scheduledAt:number, deliverAt:number,type:string,message:string){


        this.deliverAt = deliverAt || Number.POSITIVE_INFINITY;
        this.scheduledAt = scheduledAt;
        this.cancelled = false;
        this.type=type;
        this.message = message;
        this.id= SimEvent.count;
        this.name  = "event"+this.id;
        SimEvent.count ++;
        this.callbacks = [];
    }


    deliver(){
        //The event should be executerd, this means that all listeners should be notified
         for (let i = 0; i < this.callbacks.length; i++) {

            this.callbacks[i]();
    
    }



}




    done(onWhenDone:Function,nextEvent:SimEvent=null) : SimEvent{
           this.callbacks.push(onWhenDone);
            return nextEvent as SimEvent || this;
    }
}