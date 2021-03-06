
import {Resource,ResourceStates,ScheduledStates} from '../model/resource';
import {Entity,EntityStates} from '../model/entity';
import {IEntity} from '../model/ientity';
import {ISimulation} from '../model/iSimulation';
import {Simulation,Variable,ExistingVariables,SimulationRecord} from '../simulation';
import {Statistics} from '../stats/statistics';
import {EntityStats, EntityDurations} from '../stats/entityStats';
import {ResourceStats,ResourceDurations} from '../stats/resourceStats';


export class Recorder{


    static instance : Recorder;

    entityRecordings : Map<Entity,EntityDurations>;
    resourceRecordings : Map<Resource,ResourceDurations>;

    statistics:Statistics;
    simulation:ISimulation;
    variables:Variable[];

    constructor(simulation:ISimulation){
        this.variables = [];
        this.simulation = simulation;
        this.statistics = new Statistics();
        Recorder.instance = this;
        this.entityRecordings  = new Map<Entity,EntityDurations>();
        this.resourceRecordings  = new Map<Resource,ResourceDurations>();
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

                this.recordResource(resource);
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
                
                    this.recordResource(resource);
                   
            })

    }



    recordResource(resource:Resource){
            let resStat =  this.resourceStats(resource);
                    let duration = this.simulation.simTime - resource.lastStateChangedTime;
 
                    if(resource.scheduledState===ScheduledStates.scheduled)
                    {
                        
                        resStat.totalScheduledTime += this.simulation.simTime-resource.lastStateChangedTime;
                    }else{
                        resStat.totalUnScheduledTime += this.simulation.simTime-resource.lastStateChangedTime;
              
                    }
                    let totalCurrentScheduledTime = resStat.totalScheduledTime;
                   switch (resource.state) {
                case ResourceStates.idle:
                    //The resource IS NOT IDLE ANYMORE
                    resource.idleTime+=duration;
                    resStat.totalIdleTime+=duration;
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalIdleTime,resStat.totalIdleTime);
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalIdleTimePercentage,resStat.totalIdleTime/totalCurrentScheduledTime);
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceAverageIdleTime,resStat.averageIdleTime+ duration/resStat.currentScheduled);
                   
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
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceAverageBusyTime,resStat.averageBusyTime+ duration/resStat.currentScheduled);
                   
                    break;
                case ResourceStates.transfer:
                    //The resource IS NOT IDLE ANYMORE
                    resource.transferTime+=duration;
                    resStat.totalTransferTime+=duration;
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalTransferTime,resStat.totalTransferTime);
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalTransferTimePercentage,resStat.totalTransferTime/totalCurrentScheduledTime);
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceAverageTransferTime,resStat.averageTransferTime+ duration/resStat.currentScheduled);
                    
                    break;
                case ResourceStates.broken:
                    //The resource IS NOT IDLE ANYMORE
                    resource.brokenTime+=duration;
                    resStat.totalBrokenTime+=duration;
                    break;
                case ResourceStates.wait:
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
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalOtherTime,resStat.totalOtherTime);
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalOtherTimePercentage,resStat.totalOtherTime/totalCurrentScheduledTime);
                   
                    break;
                case ResourceStates.inActive:
                    //The resource IS NOT IDLE ANYMORE
                    resource.inActiveTime+=duration;
                    resStat.totalinActiveTime+=duration; 
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalInActiveTime,resStat.totalinActiveTime);
                    this.createSimulationRecord(resource.type,ExistingVariables.resourceTotalInActiveTimePercentage,resStat.totalinActiveTime/totalCurrentScheduledTime);
                   
                    break;
            
                default:
                    break;
            }
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
        if(!this.statistics.resourceStats.has(type)){
           let res = new ResourceStats(type);
            res.currentScheduled = count;
            this.statistics.resourceStats.set(type,res);  
            this.simulation.recorder.createSimulationRecord(type,ExistingVariables.resourceTotalIdleTimePercentage,1);
    
        }
    }

    addResourceStateListeners(resource:Resource){
    
        resource.emitter.on("onBeforeResourceStateChanged",this.onResourceBeforeStateChanged);
        resource.emitter.on("unScheduled",this.onResourceUnScheduled);
        resource.emitter.on("scheduled",this.onResourceScheduled);
        resource.emitter.on("onResourceBusy",this.onResourceBusy);
    }

//ENTITIES

 

 addEntityStateListeners(entity:Entity){
    
        entity.emitter.on("onBeforeEntityStateChanged",this.onEntityBeforeStateChanged);
    }



    onEntityBeforeStateChanged = (entity:Entity)=>{

                
                
            

            this.recordEntityStat(entity,)
            


 
    }

 private recordEntityStat(entity:Entity){
        
      
            let entityStat =  this.entityStats(entity);
            let duration = this.simulation.simTime - entity.lastStateChangedTime;
            entityStat.totTime += this.simulation.simTime - entity.lastStateChangedTime;

        switch (entity.state) {
            case EntityStates.valueAdded:
                 entity.valueAddedTime+=duration;
                 entityStat.totalValueAddedTime +=duration;
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalValueAddedTime,entityStat.totalValueAddedTime);
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalValueAddedTimePercentage,entityStat.totalValueAddedTime/entityStat.totTime);
                   
                break;
            case EntityStates.wait:
                 entity.waitTime+=duration;
                 entityStat.totalWaitTime += duration;
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalWaitTime,entityStat.totalWaitTime);
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalWaitTimePercentage,entityStat.totalWaitTime/entityStat.totTime);
              break;
            case EntityStates.nonValueAdded:
                 entity.nonValueAddedTime+=duration;
                 entityStat.totalNonValueAddedTime += duration;
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalNonValueAddedTime,entityStat.totalNonValueAddedTime);
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalNonValueAddedTimePercentage,entityStat.totalNonValueAddedTime/entityStat.totTime);
              break;
            case EntityStates.transfer:
                 entity.transferTime += duration;
                 entityStat.totalTransferTime += duration;
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalTransferTime,entityStat.totalTransferTime);
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalTransferTimePercentage,entityStat.totalTransferTime/entityStat.totTime);
              break;
            case EntityStates.other:
                 entity.otherTime += duration;
                 entityStat.totalOtherTime += duration;
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalWaitTime,entityStat.totalOtherTime);
                 this.createSimulationRecord(entity.type,ExistingVariables.entityTotalWaitTimePercentage,entityStat.totalOtherTime/entityStat.totTime);
              break;
        
            default:
                break;
        }

        
            entity.lastStateChangedTime  = this.simulation.simTime;
    }



    finalizeEntityRecords(){
         //WIP
        this.simulation.entities.forEach(entity=>{
            if (entity.finalize) {
            entity.finalize();
        }
            this.recordEntityStat(entity);
        let entityModel = this.simulation.entityModels.get(entity.type);
        if(entityModel.recordWip){
            this.recordEntityStats(entity);
        }
        });

    }
 listenResource(resourceEvent: any){
        
            let eDur = Recorder.instance.resourceRecordings.get(resourceEvent.resource);
            let duration = Recorder.instance.simulation.simTime - resourceEvent.resource.lastStateChangedTime;
            eDur[resourceEvent.event] +=duration;
    }

    startRecordResourceStats(resource:Resource, event : string){
        if(!this.resourceRecordings.has(resource))
        {
            let eDur = new ResourceDurations();
            this.resourceRecordings.set(resource,eDur);
            resource.emitter.on(event,this.listenResource)
        }else{
            let eDur = this.resourceRecordings.get(resource);
            this.resourceRecordings.set(resource,eDur);
            resource.emitter.on(event,this.listenResource)
        }
    }


    endRecordResourceStats(resource:Resource,event:string,deleteResource:boolean=true) : ResourceDurations{
        
        if(this.resourceRecordings.has(resource))
        {
            let eDur =  this.resourceRecordings.get(resource);
            if(deleteResource)
                this.resourceRecordings.delete(resource);
            resource.emitter.removeListener(event,this.listenResource);

            return eDur;
        }
            
        return null;


    }

    listenEntity(entityEvent: any){
        
            let eDur = Recorder.instance.entityRecordings.get(entityEvent.entity);
            let duration = Recorder.instance.simulation.simTime - entityEvent.entity.lastStateChangedTime;
            eDur[entityEvent.event] +=duration;
    }

    startRecordEntityStats(entity:Entity, event : string){
        if(!this.entityRecordings.has(entity))
        {
            let eDur = new EntityDurations();
            this.entityRecordings.set(entity,eDur);
            entity.emitter.on(event,this.listenEntity)
        }
    }


    endRecordEntityStats(entity:Entity,event:string) : EntityDurations{
        
        if(this.entityRecordings.has(entity))
        {
            let eDur =  this.entityRecordings.get(entity);
            this.entityRecordings.delete(entity);
            entity.emitter.removeListener(event,this.listenEntity);

            return eDur;
        }
            
        return null;


    }


    recordEntityDispose(entity:Entity){
        
        let entStat = this.entityStats(entity);
        let oldCount = entStat.countStats.count;
        entStat.countStats.record(entStat.count,entity.timeDisposed  - entity.timeCreated);
        entStat.totalTime.record(entity.timeDisposed  - entity.timeCreated);
 
 
                

        this.recordEntityStat(entity);
        this.recordEntityStats(entity);
        this.entityStats(entity).count--;

        
        this.createSimulationRecord(entity.type,ExistingVariables.entityAverageWaitTime,entStat.averageWaitTime*oldCount/(oldCount+1)+entity.waitTime/(oldCount+1));
                
    }

    recordEntityCreate(entity:Entity){
        
        this.entityStats(entity).count++;
    }

  
    recordEntityStats(entity : Entity){
        
        this.entityStats(entity).nonValueAddedTime.record(entity.nonValueAddedTime);
        this.entityStats(entity).waitTime.record(entity.waitTime);
        this.entityStats(entity).transferTime.record(entity.transferTime);
        this.entityStats(entity).valueAddedTime.record(entity.valueAddedTime);
        this.entityStats(entity).otherTime.record(entity.otherTime);
    }

    addEntityStats(type : string){ 
        if(!this.statistics.entityStats.has(type)){
            this.statistics.entityStats.set(type,new EntityStats(type));
            this.simulation.recorder.createSimulationRecord(type,ExistingVariables.entityTotalValueAddedTimePercentage,1);

        }
     
    } 

    entityStats(entity : Entity) : EntityStats{
        return this.statistics.entityStats.get(entity.type);
    }

    getTotalCurrentTime(entity:Entity) : number{

        let resStat =  this.entityStats(entity);

        let total = resStat.totalTime.Sum;;

          this.simulation.entities.forEach(entity=>{
              total += this.simulation.simTime - entity.timeCreated;
                   
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

















































