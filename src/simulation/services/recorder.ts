
import {Resource,ResourceStates,ScheduledStates} from '../model/resource';
import {Entity,Allocations} from '../model/entity';
import {Simulation} from '../simulation';
import {Statistics} from '../stats/statistics';
import {EntityStats} from '../stats/entityStats';
import {ResourceStats} from '../stats/resourceStats';


export class Recorder{


    statistics:Statistics;
    simulation:Simulation;

    constructor(simulation:Simulation){

        this.simulation = simulation;
        this.statistics = new Statistics();
    }

//RESOURCES

    onResourceBeforeStateChanged = (resource:Resource)=>{

                
            let resStat =  this.resourceStats(resource);
            let duration = this.simulation.simTime - resource.lastStateChangedTime;

            switch (resource.state) {
                case ResourceStates.idle:
                    //The resource IS NOT IDLE ANYMORE
                    resource.idleTime+=duration;
                    resStat.totalIdleTime+=duration;
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
                    break;
                case ResourceStates.transfer:
                    //The resource IS NOT IDLE ANYMORE
                    resource.transferTime+=duration;
                    resStat.totalTransferTime+=duration;
                    break;
                case ResourceStates.broken:
                    //The resource IS NOT IDLE ANYMORE
                    resource.brokenTime+=duration;
                    resStat.totalBrokenTime+=duration;
                    break;
                case ResourceStates.seized:
                    //The resource IS NOT IDLE ANYMORE
                    //resource+=simulation.simTime - resource.lastStateChangedTime;
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

                    switch (resource.state) {
                        case ResourceStates.idle:
                            //The resource IS NOT IDLE ANYMORE
                            resource.idleTime+=duration;
                            resStat.totalIdleTime+=duration;
                            break;
                        case ResourceStates.busy:
                            //The resource IS NOT IDLE ANYMORE
                            resource.busyTime+=duration;
                            resStat.totalBusyTime+=duration;

                            break;
                        case ResourceStates.transfer:
                            //The resource IS NOT IDLE ANYMORE
                            resource.transferTime+=duration;
                            resStat.totalTransferTime+=duration;
                            break;
                        case ResourceStates.broken:
                            //The resource IS NOT IDLE ANYMORE
                            resource.brokenTime+=duration;
                            resStat.totalBrokenTime+=duration;
                            break;
                        case ResourceStates.seized:
                            //The resource IS NOT IDLE ANYMORE
                            //resource+=simulation.simTime - resource.lastStateChangedTime;
                            break;
                        case ResourceStates.other:
                            //The resource IS NOT IDLE ANYMORE
                            resource.otherTime+=duration;
                            resStat.totalOtherTime+=duration;
                            break;
                    
                        default:
                            break;
                    }
                    
                    if(resource.scheduledState===ScheduledStates.scheduled)
                    {
                        
                        resStat.totalScheduledTime += this.simulation.simTime-resStat.lastScheduledTime;
                    }else{
                        resStat.totalUnScheduledTime += this.simulation.simTime-resStat.lastScheduledTime;
              
                    }
            })

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
            this.recordEntityStats(entity,this.simulation);
        }
        });

    }


    recordEntityDispose(entity:Entity){
        
        this.entityStats(entity).countStats.leave(entity.timeEntered,this.simulation.simTime);
        this.entityStats(entity).totalTime.record(entity.timeLeft  - entity.timeEntered);
        this.recordEntityStats(entity,this.simulation);
                
    }

    recordEntityCreate(entity:Entity){
        this.entityStats(entity).countStats.enter(this.simulation.simTime);
    }

    recordEntityStat(entity:Entity,  timeStampBefore : number,allocation : Allocations = Allocations.valueAdded){
        switch (allocation) {
            case Allocations.valueAdded:
                entity.valueAddedTime += this.simulation.simTime - timeStampBefore;
                //this.entityStats(entity).nonValueAddedTime.record(this.simTime - timeStampBefore);
                break;
            case Allocations.wait:
                entity.waitTime += this.simulation.simTime - timeStampBefore;
                //this.entityStats(entity).nonValueAddedTime.record(this.simTime - timeStampBefore);
                break;
            case Allocations.nonValueAdded:
                entity.nonValueAddedTime += this.simulation.simTime - timeStampBefore;
                //this.entityStats(entity).nonValueAddedTime.record(this.simTime - timeStampBefore);
                break;
            case Allocations.transfer:
                entity.transferTime += this.simulation.simTime - timeStampBefore;
                //this.entityStats(entity).nonValueAddedTime.record(this.simTime - timeStampBefore);
                break;
            case Allocations.other:
                entity.otherTime += this.simulation.simTime - timeStampBefore;
                //this.entityStats(entity).nonValueAddedTime.record(this.simTime - timeStampBefore);
                break;
        
            default:
                break;
        }
    }

    recordEntityStats(entity : Entity, simulation:Simulation){
        
        this.entityStats(entity).nonValueAddedTime.record(entity.nonValueAddedTime);
        this.entityStats(entity).waitTime.record(entity.waitTime);
        this.entityStats(entity).transferTime.record(entity.transferTime);
        this.entityStats(entity).valueAddedTime.record(entity.valueAddedTime);
        this.entityStats(entity).otherTime.record(entity.otherTime);
    }

    addEntityStats(type : string){
         this.statistics.entityStats.set(type,new EntityStats(type));
     
    }

    entityStats(entity : Entity) : EntityStats{
        return this.statistics.entityStats.get(entity.type);
    }




//PROCESSES

    finalizeProcessRecords(){
         this.simulation.processes.forEach(p=>{
            p.finalize();
            // this.reportProcess(p);
         });
    }














}

















































