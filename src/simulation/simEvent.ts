




export class SimEvent<T extends ISimEventResult> implements ISimEvent{



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


    constructor(scheduledAt:number, deliverAt:number,type:string,message:string){


        this.deliverAt = deliverAt || Number.POSITIVE_INFINITY;
        this.scheduledAt = scheduledAt;
        this.cancelled = false;
        this.type=type;
        this.message = message;
        this.id= SimEvent.count;
        this.name  = "event"+this.id;
        SimEvent.count ++;
    }






 


}



    export interface ISimEventResult{
    }

    export interface ISimEvent{
        deliverAt:number;
        id:number;
        message:string;
        type: string;
        name:string;
        isScheduled:boolean ;
        promise:Promise<ISimEventResult>
        
    } 