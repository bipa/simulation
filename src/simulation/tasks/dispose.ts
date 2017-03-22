

import { SimEvent , ISimEventResult} from '../simEvent';
import { Simulation } from '../simulation';
import { Entity, Allocations } from '../model/entity';
import { Resource, ResourceStates } from '../model/resource';
import { Distribution } from '../stats/distributions';
import { ISimulation } from '../model/iSimulation';


export class Dispose{
        
        
       
       


       static dispose(simulation:ISimulation,entity: Entity) 
       : Promise<DisposeResult>{

            let simEvent  =Dispose.disposeEvent(simulation,entity);

            return simEvent.promise;
       }


       static disposeEvent(simulation:ISimulation,entity: Entity) : SimEvent<DisposeResult>{
           
           
            entity.dispose(simulation.simTime);
            simulation.recorder.recordEntityDispose(entity);
            simulation.removeEntity(entity);
          /*  let simEvent =  simulation.setTimer<DisposeResult>(0, "dispose", `${entity.name} is disposed`);
            simEvent.result = new DisposeResult(entity);

            return simEvent;*/

            return null;

       }


}


export class DisposeResult implements ISimEventResult{

        entity:Entity;

        constructor(entity : Entity){
            this.entity = entity;
                }
}