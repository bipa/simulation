

import {Entity} from '../model/entity';
import {Resource} from '../model/resource';
import {Route} from '../model/route';
import {Station} from '../model/station';
import {Process} from '../tasks/process';
import {ISimulation} from '../model/iSimulation';
import {Simulation,SimulationRecord} from '../simulation';
import {SimEvent,ISimEventResult,ISimEvent} from '../simEvent';

import {PriorityQueue} from '../queues/priorityQueue';

export class Simulator{


    simulation:ISimulation;

    _queue:PriorityQueue<ISimEvent>;
    unscheduledEvents : Map<number,ISimEvent>



    constructor(simulation:ISimulation){

        this.simulation = simulation;
        this._queue = new PriorityQueue<ISimEvent>((queueItem1,queueItem2)=>  { 
            return queueItem1.deliverAt < queueItem2.deliverAt 
        });
    

        this.unscheduledEvents = new Map<number,ISimEvent>();


     }




     step(){
        if(this._queue.size ===0 )
        {
             this.simulation.finalize();
            this.simulation.eventEmitter.emit("done", true);
            return;
        } 
      

        let simEvent  = this._queue.poll();

        this.simulation.simTime = simEvent.deliverAt;
      this.simulation.eventCount++;
      this.simulation.currentSimEvent = simEvent;

    if (simEvent.deliverAt > this.simulation.endTime)  {
          this.simulation.finalize();
          this.simulation.eventEmitter.emit("done", true);
          return;
      };


     // event.isConcurrent ? this.simTime = event.deliverAt-Simulation.epsilon : this.simTime  = event.deliverAt;
      if(simEvent.log) this.simulation.log(simEvent.message,simEvent.type);
        let nextItem = simEvent.next();

        //if the generator is still not finished, put it back in the queue
        //if it has a deliverAt time.
        if(!nextItem.done)
        {
               if(!simEvent.onHold)
               {    
                    this._queue.add(simEvent);
               }else{
                   this.unscheduledEvents.set(simEvent.id,simEvent);
               }
        }
        else{
             this.simulation.eventEmitter.emit(simEvent.name, true);
        }
        


       this.step();
            


     }







scheduleEvent(simEvent:ISimEvent){

    if(this.unscheduledEvents.has(simEvent.id))
    {
        simEvent.onHold = false;
        this.unscheduledEvents.delete(simEvent.id);

    }
   
    this._queue.add(simEvent);


    //this.unscheduledEvents.delete(simEvent.id);
}


 










}




































