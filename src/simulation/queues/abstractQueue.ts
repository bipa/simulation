import {Queue} from './queue';
import {Simulation} from '../simulation';
import {Population,PopulationRecord} from '../stats/dataRecorder';
import {IEntity} from '../model/iEntity';
import {Entity} from '../model/entity';


let EventEmitter = require('events');



export class AbstractQueue<T extends IEntity>{

    static count : number = 0;

    simulation:Simulation;
    stats:Population;
    name:string;
    timeStamps:Map<T,number>;
    countEntered:number;
    countLeft:number;
    current:number;
    eventEmitter: any;

    constructor(sim:Simulation, name:string = null){
        this.simulation  = sim;
        this.timeStamps = new Map<T,number>();
        this.stats = new Population();
        this.name = name || "queue" + AbstractQueue.count;
        this.countEntered =0;
        this.countLeft = 0;
        this.current = 0;
        this.eventEmitter = new EventEmitter();
    }

    
    enqueue(item : T){
        let timeStamp = this.simulation.simTime;
        this.timeStamps.set(item,timeStamp);
        this._innerEnqueue(item);
        this.stats.enter(timeStamp);
        this.countEntered++;
        this.current++;
        item.enqueue(timeStamp);
        this.simulation.log(`${item.name} enqueued`, "enqueue")

        this.eventEmitter.emit("enqueued",item)
    }
 

    dequeue() : T{
        
        let item  = this._innerDequeue();
        let timeStamp = this.timeStamps.get(item);
        let simTime = this.simulation.simTime;
        this.stats.leave(timeStamp,simTime);
        this.eventEmitter.emit("dequeued",item)
        this.countLeft++;
        this.current--;
        item.dequeue(simTime);
        //Check if there is more items in the queue, and notice if so, by the name of the enitity
        if (this.length > 0) {
            let nextItem = this.peek();
            this.eventEmitter.emit(nextItem.name, nextItem);
        } 

       return item;
    }

    peek() : T{
       return this._innerPeek();
    }


    get length(): number{
        return this._innerLength();
    }


    leave(item : T){
        
         this._innerLeave();
    }


    _innerLeave(){

            throw("not implemented - this method MUST be overridden");
       

    }

    _innerPeek() : T{

            throw("not implemented - this method MUST be overridden");
       

    }

    _innerLength() : number{

            throw("not implemented - this method MUST be overriden");
       

    }

    _innerEnqueue(item : T){

            throw("not implemented - this method MUST be overriden");
       
      
    }


    _innerDequeue() : T{

            throw("not implemented - this method MUST be overriden");
       
    }

    report() : PopulationRecord{
        return this.stats.report();
    }
 


    finalize(){
        this.stats.finalize(this.simulation.simTime);
    }



}