import {Queue} from './queue';
import {AbstractQueue} from './abstractQueue.1';
import {Simulation} from '../simulation.1';
import {} from './stats';


export class FifoQueue<T> extends AbstractQueue<T>{



    sim:Simulation;
    queue:Queue<T>;

    constructor(sim:Simulation, name:string=null){
        super(sim,name);
        this.queue = new Queue<T>();
    }

    
    _innerEnqueue(item : T){
        this.queue.enqueue(item);
    }


    _innerDequeue() : T{

       return this.queue.dequeue();
    }


    
    _innerLength() : number{

        return this.queue.length;
       

    }


    
    _innerPeek() : T{

        return this.queue.peek();
       

    }


}