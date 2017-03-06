import {Queue} from './queue';
import {Simulation} from '../simulation';
import {Population,PopulationRecord} from '../stats/stats';


export class AbstractQueue<T>{

    static count : number = 0;

    sim:Simulation;
    stats:Population;
    name:string;
    timeStamps:Map<T,number>;
    countEntered:number;
    countLeft:number;
    current:number;

    constructor(sim:Simulation, name:string = null){
        this.sim  = sim;
        this.timeStamps = new Map<T,number>();
        this.stats = new Population();
        this.name = name || "queue" + AbstractQueue.count;
        this.countEntered =0;
        this.countLeft = 0;
        this.current = 0;
    }

    
    enqueue(item : T){
        let timeStamp = this.sim.simTime;
        this.timeStamps.set(item,timeStamp);
        this._innerEnqueue(item);
        this.stats.enter(timeStamp);
        this.countEntered++;
        this.current++;
    }


    dequeue() : T{
        
        let item  = this._innerDequeue();
        let timeStamp = this.timeStamps.get(item);
        let simTime = this.sim.simTime;
        this.stats.leave(timeStamp,simTime);
        this.countLeft++;
        this.current--;

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

            throw("not implemented - this method MUST be overriden");
       

    }

    _innerPeek() : T{

            throw("not implemented - this method MUST be overriden");
       

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
        this.stats.finalize(this.sim.simTime);
    }



}