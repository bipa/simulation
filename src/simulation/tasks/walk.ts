

import { SimEvent } from '../simEvent.1';
import { Simulation } from '../simulation.1';
import { Station } from '../model/station';
import { Entity } from '../model/entity';



export class Walk{
        
        
       
       


       static walk(simulation:Simulation,from:Station,to : Station,entity:Entity,speed=1) 
       : Promise<SimEvent>{

            speed = entity.speed  || speed;
            
            


            return null;
       }

}