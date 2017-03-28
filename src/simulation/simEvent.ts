

import {Entity} from './model/entity';
import {IEntity} from './model/ientity';
import {Station} from './model/station';
import {Route} from './model/route';
import {Resource} from './model/resource';

import {IId} from './model/iId';


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
    entities : Entity[] =[];
    resources : Resource[] =[];
    stations : Station[] =[];
    routes : Route[] =[];
    delay :number;



    generator:any;
    currentResult:any;

    constructor(scheduledAt:number, delay:number,type:string=null,message:string=null){

        if(delay===null) delay = Number.POSITIVE_INFINITY;
        this.delay = delay;
        this.scheduledAt = scheduledAt;
        this.deliverAt = scheduledAt+delay;
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

    export interface ISimEvent extends IId{
        deliverAt:number;
        scheduledAt:number;
        delay :number;
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
         entities : Entity[] ;
        resources : Resource[] ;
        stations : Station[] ;
        routes : Route[] ;
        currentResult:any;
        next :() => NextResult<ISimEventResult>;
    } 