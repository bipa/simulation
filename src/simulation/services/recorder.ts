
import {Resource,ResourceStates,ScheduledStates} from '../model/resource';
import {Simulation} from '../simulation';


export class Recorder{


    constructor(){

    }



    recordBeforeResourceStateChanged(resource:Resource, simulation:Simulation){

                
            let resStat =  simulation.resourceStats(resource);
            let duration = simulation.simTime - resource.lastStateChangedTime;

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
                    resStat.numberBusy.record(resStat.currentBusy,simulation.simTime-resStat.lastRecordedTime);

                    if(resStat.currentScheduled===0)
                    {
                        resStat.instantaneousUtilization.record(0, simulation.simTime-resStat.lastRecordedTime)
                    
                    }
                    else{
                        resStat.instantaneousUtilization.record(resStat.currentBusy/resStat.currentScheduled, simulation.simTime-resStat.lastRecordedTime)
                    
                    }
                    resStat.lastRecordedTime = simulation.simTime;
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
            
            resource.lastStateChangedTime  = simulation.simTime;



    }


    onUnScheduled(resource:Resource, simulation:Simulation){

            
            let resStat =  simulation.resourceStats(resource);
            resStat.numberScheduled.record(resStat.currentScheduled,simulation.simTime-resStat.lastRecordedTime);
            
            resStat.totalScheduledTime += simulation.simTime-resStat.lastScheduledTime;

            resStat.numberBusy.record(resStat.currentBusy,simulation.simTime-resStat.lastRecordedTime);
            resStat.instantaneousUtilization.record(resStat.currentBusy/resStat.currentScheduled, simulation.simTime-resStat.lastRecordedTime)
            
            resStat.lastScheduledTime = simulation.simTime;
            resStat.lastRecordedTime = simulation.simTime;
            resStat.currentScheduled--;


    }


    onScheduled(resource:Resource, simulation:Simulation){

            
            let resStat =  simulation.resourceStats(resource);
                resStat.numberScheduled.record(resStat.currentScheduled,simulation.simTime-resStat.lastRecordedTime);
                resStat.numberBusy.record(resStat.currentBusy,simulation.simTime-resStat.lastRecordedTime);

                if(resStat.currentScheduled===0)
                {
                    resStat.instantaneousUtilization.record(0, simulation.simTime-resStat.lastRecordedTime)
                
                }
                else{
                    resStat.instantaneousUtilization.record(resStat.currentBusy/resStat.currentScheduled,simulation.simTime-resStat.lastRecordedTime)
                
                }

                resStat.lastScheduledTime = simulation.simTime;
                resStat.lastRecordedTime = simulation.simTime;
                resStat.currentScheduled++;


    }


    onResourceBusy(resource:Resource, simulation:Simulation){


                    let resStat =  simulation.resourceStats(resource);
                    resStat.numberBusy.record(resStat.currentBusy,simulation.simTime-resStat.lastRecordedTime);

                    if(resStat.currentScheduled===0)
                    {
                        resStat.instantaneousUtilization.record(0, simulation.simTime-resStat.lastRecordedTime)
                    
                    }
                    else{
                        resStat.instantaneousUtilization.record(resStat.currentBusy/resStat.currentScheduled, simulation.simTime-resStat.lastRecordedTime)
                    
                    }
                    resStat.lastRecordedTime = simulation.simTime;
                    resStat.currentBusy++;



    }


    finalizeResourceRecords(simulation:Simulation){


            simulation.statistics.resourceStats.forEach(resStat=>{
            resStat.numberScheduled.record(resStat.currentScheduled,simulation.simTime-resStat.lastRecordedTime);
            resStat.numberBusy.record(resStat.currentBusy,simulation.simTime-resStat.lastRecordedTime);

            if(resStat.currentScheduled===0)
            {
                resStat.instantaneousUtilization.record(0, simulation.simTime-resStat.lastRecordedTime)
            
            }
            else{
                resStat.instantaneousUtilization.record(resStat.currentBusy/resStat.currentScheduled, simulation.simTime-resStat.lastRecordedTime)
            
            }

            })


            simulation.resources.forEach(resource=>{
                
                    let resStat =  simulation.resourceStats(resource);
                    let duration = simulation.simTime - resource.lastStateChangedTime;

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
                        
                        resStat.totalScheduledTime += simulation.simTime-resStat.lastScheduledTime;
                    }
            })

    }




















}

















































