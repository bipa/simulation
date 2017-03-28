
import {Resource,ResourceStates,ScheduledStates} from '../model/resource';
import {Entity,EntityStates} from '../model/entity';
import {IEntity} from '../model/ientity';
import {ISimulation} from '../model/iSimulation';
import {Simulation,Variable,ExistingVariables,SimulationRecord} from '../simulation';
import {Statistics} from '../stats/statistics';
import {EntityStats} from '../stats/entityStats';
import {ResourceStats} from '../stats/resourceStats';


export class Recorder{


    statistics:Statistics;
    simulation:ISimulation;
    variables:Variable[];

    constructor(simulation:ISimulation){
        this.variables = [];
        this.simulation = simulation;
        this.statistics = new Statistics();
    }

//VARIABLES

addExistingVariable(variable:Variable){
    this.variables.push(variable);
}

createSimulationRecord(type :string,existingVariable:ExistingVariables,value:number){
   
   let variable = this.variables.find(variable=>{return variable.type === type 
       && variable.variable === existingVariable});

   if(variable)
   {
        let simREc = new SimulationRecord(this.simulation.simTime,variable.name,value);
        this.simulation.simulationRecords.push(simREc);
   }


  
      


}



//RESOURCES

    onResourceBeforeStateChanged = (resource:Resource)=>{

                
            let resStat =  this.resourceStats(resource);
            let duration = this.simulation.simTime - resource.lastStateChangedTime;
            let totalCurrentScheduledTime = this.getTotalCurrentScheduledTime(resource);

            switch (resource.state) {
                case ResourceStates.idle:
                    //The resource IS NOT IDLE ANYMORE
                    resource.idleTime+=duration;
                    resStat.totalIdleTime+=duration;
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalIdleTime,resStat.totalIdleTime);
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalIdleTimePercentage,resStat.totalIdleTime/totalCurrentScheduledTime);
                   
                    break;
                case ResourceStates.busy:
                    //The resource IS NOT IDLE ANYMORE
                    resource.busyTime+=duration;
                    resStat.totalBusyTime+=duration;
                    resStat.numberBusy.record(resStat.currentBusy,this.simulation.simTime-resStat.lastRecordedTime);

                    if(resStat.currentScheduled===0)
                    {
                        resStat.instantaneousUtilization.record(0, this.simulation.simTime-resStat.lastRecordedTime)
                    
                    }
                    else{
                        resStat.instantaneousUtilization.record(resStat.currentBusy/resStat.currentScheduled, this.simulation.simTime-resStat.lastRecordedTime)
                    
                    }
                    resStat.lastRecordedTime = this.simulation.simTime;
                    resStat.currentBusy--;

                    this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalInstantaneousUtilization,resStat.instantaneousUtilization.average);
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalBusyTime,resStat.totalBusyTime);
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalBusyTimePercentage,resStat.totalBusyTime/totalCurrentScheduledTime);
                   
                    break;
                case ResourceStates.transfer:
                    //The resource IS NOT IDLE ANYMORE
                    resource.transferTime+=duration;
                    resStat.totalTransferTime+=duration;
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalTransferTime,resStat.totalTransferTime);
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalTransferTimePercentage,resStat.totalTransferTime/totalCurrentScheduledTime);
                    
                    break;
                case ResourceStates.broken:
                    //The resource IS NOT IDLE ANYMORE
                    resource.brokenTime+=duration;
                    resStat.totalBrokenTime+=duration;
                    break;
                case ResourceStates.seized:
                    //The resource IS NOT SEIZED STATE ANYMORE
                     resource.waitTime +=duration;
                     resStat.totalWaitTime +=duration;
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalWaitTime,resStat.totalWaitTime);
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalWaitTimePercentage,resStat.totalWaitTime/totalCurrentScheduledTime);
                   

                    break;
                case ResourceStates.other:
                    //The resource IS NOT IDLE ANYMORE
                    resource.otherTime+=duration;
                    resStat.totalOtherTime+=duration;
                    break;
            
                default:
                    break;
            }
            
            resource.lastStateChangedTime  = this.simulation.simTime;


 
    }


    onResourceUnScheduled=(resource:Resource)=>{

            
        let resStat =  this.resourceStats(resource);
        let duration = this.simulation.simTime-resStat.lastRecordedTime;
        resStat.numberScheduled.record(resStat.currentScheduled,duration);

        resStat.totalScheduledTime += this.simulation.simTime-resStat.lastScheduledTime;

        resStat.numberBusy.record(resStat.currentBusy,duration);
        resStat.instantaneousUtilization.record(
            resStat.currentBusy/resStat.currentScheduled, duration)

        resStat.lastScheduledTime = this.simulation.simTime;
        resStat.lastRecordedTime = this.simulation.simTime;
        resStat.currentScheduled--;


    }


    onResourceScheduled=(resource:Resource)=>{

        let resStat =  this.resourceStats(resource);
        let duration = this.simulation.simTime-resStat.lastRecordedTime;
        resStat.numberScheduled.record(resStat.currentScheduled,duration);
        resStat.numberBusy.record(resStat.currentBusy,duration);

        resStat.totalUnScheduledTime += this.simulation.simTime-resStat.lastScheduledTime;
        if(resStat.currentScheduled===0)
        {
           resStat.instantaneousUtilization.record(0, duration)
                
        }
        else{
            resStat.instantaneousUtilization.record(
                resStat.currentBusy/resStat.currentScheduled,duration)
                
        }

        resStat.lastScheduledTime = this.simulation.simTime;
        resStat.lastRecordedTime = this.simulation.simTime;
        resStat.currentScheduled++;
    
    }


    onResourceBusy=(resource:Resource)=>{

        let resStat =  this.resourceStats(resource);
        resStat.numberBusy.record(resStat.currentBusy,this.simulation.simTime-resStat.lastRecordedTime);

        if(resStat.currentScheduled===0)
        {
                        resStat.instantaneousUtilization.record(0, this.simulation.simTime-resStat.lastRecordedTime)
                    
        }
        else{
                        resStat.instantaneousUtilization.record(resStat.currentBusy/resStat.currentScheduled, this.simulation.simTime-resStat.lastRecordedTime)
                    
        }
        resStat.lastRecordedTime = this.simulation.simTime;
        resStat.currentBusy++;
    }


    finalizeResourceRecords(){


            this.statistics.resourceStats.forEach(resStat=>{
                resStat.numberScheduled.record(resStat.currentScheduled,this.simulation.simTime-resStat.lastRecordedTime);
                resStat.numberBusy.record(resStat.currentBusy,this.simulation.simTime-resStat.lastRecordedTime);

                if(resStat.currentScheduled===0)
                {
                    resStat.instantaneousUtilization.record(0, this.simulation.simTime-resStat.lastRecordedTime)
                
                }
                else{
                    resStat.instantaneousUtilization.record(resStat.currentBusy/resStat.currentScheduled, this.simulation.simTime-resStat.lastRecordedTime)
                
                }

                resStat.simTime = this.simulation.simTime;

            })


            this.simulation.resources.forEach(resource=>{
                
                    let resStat =  this.resourceStats(resource);
                    let duration = this.simulation.simTime - resource.lastStateChangedTime;
 
                    if(resource.scheduledState===ScheduledStates.scheduled)
                    {
                        
                        resStat.totalScheduledTime += this.simulation.simTime-resStat.lastScheduledTime;
                    }else{
                        resStat.totalUnScheduledTime += this.simulation.simTime-resStat.lastScheduledTime;
              
                    }

                    switch (resource.state) {
                        case ResourceStates.idle:
                            //The resource IS NOT IDLE ANYMORE
                            resource.idleTime+=duration;
                            resStat.totalIdleTime+=duration;
                            this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalIdleTime,resStat.totalIdleTime);
                            this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalIdleTimePercentage,resStat.totalIdleTime/resStat.totalScheduledTime);
                 
                            break;
                        case ResourceStates.busy:
                            //The resource IS NOT IDLE ANYMORE
                            resource.busyTime+=duration;
                            resStat.totalBusyTime+=duration;

                            this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalInstantaneousUtilization,resStat.instantaneousUtilization.average);
                            this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalBusyTime,resStat.totalBusyTime);
                            this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalBusyTimePercentage,resStat.totalBusyTime/resStat.totalScheduledTime);
                        
                            break;
                        case ResourceStates.transfer:
                            //The resource IS NOT IDLE ANYMORE
                            resource.transferTime+=duration;
                            resStat.totalTransferTime+=duration;
                             this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalTransferTime,resStat.totalTransferTime);
                             this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalTransferTimePercentage,resStat.totalTransferTime/resStat.totalScheduledTime);
                 
                            break;
                        case ResourceStates.broken:
                            //The resource IS NOT IDLE ANYMORE
                            resource.brokenTime+=duration;
                            resStat.totalBrokenTime+=duration;
                            break;
                        case ResourceStates.seized:
                            //If time lapses here, it means that the resource is waiting for the entity to come
                            resource.waitTime +=duration;
                            resStat.totalWaitTime +=duration;

                            
                            break;
                        case ResourceStates.other:
                            //The resource IS NOT IDLE ANYMORE
                            resource.otherTime+=duration;
                            resStat.totalOtherTime+=duration;
                            break;
                    
                        default:
                            break;
                    }
                   
            })

    }

    getTotalCurrentScheduledTime(resource:Resource) : number{

        let resStat =  this.resourceStats(resource);

        let total = resStat.totalScheduledTime;

          this.simulation.resources.forEach(resource=>{
           

  
                    if(resource.scheduledState===ScheduledStates.scheduled)
                    {
                        
                        total += this.simulation.simTime-resStat.lastScheduledTime;
                    }

          });


          return total;

    }

    resourceStats(resource : Resource) : ResourceStats{
        return this.statistics.resourceStats.get(resource.type);
    }
    

    recordResourceCreate(type : string, count : number){
           let res = new ResourceStats(type);
            res.currentScheduled = count;
            this.statistics.resourceStats.set(type,res);
    }

    addResourceStateListeners(resource:Resource){
    
        resource.emitter.on("onBeforeResourceStateChanged",this.onResourceBeforeStateChanged);
        resource.emitter.on("unScheduled",this.onResourceUnScheduled);
        resource.emitter.on("scheduled",this.onResourceScheduled);
        resource.emitter.on("onResourceBusy",this.onResourceBusy);
    }

//ENTITIES

 
    finalizeEntityRecords(){
         //WIP
        this.simulation.entities.forEach(entity=>{
            if (entity.finalize) {
            entity.finalize();
        }
        let entityModel = this.simulation.entityModels.get(entity.type);
        if(entityModel.recordWip){
            this.recordEntityStats(entity);
        }
        });

    }


    recordEntityDispose(entity:Entity){
        
        this.entityStats(entity).countStats.leave(entity.timeEntered,this.simulation.simTime);
        this.entityStats(entity).totalTime.record(entity.timeLeft  - entity.timeEntered);
        this.recordEntityStats(entity);
                
    }

    recordEntityCreate(entity:Entity){
        this.entityStats(entity).countStats.enter(this.simulation.simTime);
    }

    recordEntityStat(entity:Entity,  timeStampBefore : number,allocation : EntityStates = EntityStates.valueAdded){
        
        let entityStat = this.entityStats(entity);
        let duration = this.simulation.simTime - timeStampBefore;
        let totalTime = this.getTotalCurrentTime(entity);
        switch (allocation) {
            case EntityStates.valueAdded:
                 entity.valueAddedTime+=duration;
                 entityStat.totalValueAddedTime +=duration;
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalValueAddedTime,entityStat.totalValueAddedTime);
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalValueAddedTimePercentage,entityStat.totalValueAddedTime/totalTime);
                   
                break;
            case EntityStates.wait:
                 entity.waitTime+=duration;
                 entityStat.totalWaitTime += duration;
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalWaitTime,entityStat.totalWaitTime);
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalWaitTimePercentage,entityStat.totalWaitTime/totalTime);
              break;
            case EntityStates.nonValueAdded:
                 entity.nonValueAddedTime+=duration;
                 entityStat.totalNonValueAddedTime += duration;
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalNonValueAddedTime,entityStat.totalNonValueAddedTime);
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalNonValueAddedTimePercentage,entityStat.totalNonValueAddedTime/totalTime);
              break;
            case EntityStates.transfer:
                 entity.transferTime += duration;
                 entityStat.totalTransferTime += duration;
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalTransferTime,entityStat.totalTransferTime);
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalTransferTimePercentage,entityStat.totalTransferTime/totalTime);
              break;
            case EntityStates.other:
                 entity.otherTime += duration;
                 entityStat.totalOtherTime += duration;
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalWaitTime,entityStat.totalOtherTime);
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalWaitTimePercentage,entityStat.totalOtherTime/totalTime);
              break;
        
            default:
                break;
        }
    }

    recordEntityStats(entity : Entity){
        
        this.entityStats(entity).nonValueAddedTime.record(entity.nonValueAddedTime);
        this.entityStats(entity).waitTime.record(entity.waitTime);
        this.entityStats(entity).transferTime.record(entity.transferTime);
        this.entityStats(entity).valueAddedTime.record(entity.valueAddedTime);
        this.entityStats(entity).otherTime.record(entity.otherTime);
    }

    addEntityStats(type : string){
         this.statistics.entityStats.set(type,new EntityStats(type));
     
    }

    entityStats(entity : IEntity) : EntityStats{
        return this.statistics.entityStats.get(entity.type);
    }

    getTotalCurrentTime(entity:Entity) : number{

        let resStat =  this.entityStats(entity);

        let total = resStat.totalTime.Sum;;

          this.simulation.entities.forEach(entity=>{
              total += this.simulation.simTime - entity.timeEntered;
                   
          });


          return total;

    }


//PROCESSES

    finalizeProcessRecords(){
        /* this.simulation.processes.forEach(p=>{
            p.finalize();
            // this.reportProcess(p);
         });*/
    }














}

















































