import {Queue} from './queue';
import {AbstractQueue} from './abstractQueue';
import {ISimulation} from '../model/isimulation';
import {IBase} from '../model/iBase';
import {} from './stats';


export class FifoQueue<T extends IBase> extends AbstractQueue<T>{



    sim:ISimulation;
    queue:Queue<T>;

    constructor(sim:ISimulation, name:string=null){
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