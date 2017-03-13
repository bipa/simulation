

import { SimEvent , ISimEventResult} from '../simEvent';
import { Simulation } from '../simulation';
import { Entity, Allocations } from '../model/entity';
import { Resource, ResourceStates } from '../model/resource';
import { Distribution } from '../stats/distributions';


export class Dispose{
        
        
       
       


       static dispose(simulation:Simulation,entity: Entity) 
       : Promise<DisposeResult>{

            let simEvent  =Dispose.disposeEvent(simulation,entity);

            return simEvent.promise;
       }


       static disposeEvent(simulation:Simulation,entity: Entity) : SimEvent<DisposeResult>{
           
           
            entity.dispose(simulation.simTime);
            simulation.recorder.recordEntityDispose(entity);
            simulation.entities.delete(entity);
            let simEvent =  simulation.setTimer<DisposeResult>(0, "dispose", `${entity.name} is disposed`);
            simEvent.result = new DisposeResult(entity);

            return simEvent;



       }


}


export class DisposeResult implements ISimEventResult{

        entity:Entity;

        constructor(entity : Entity){
            this.entity = entity;
                }
}