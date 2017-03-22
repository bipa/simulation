

import {Simulation} from '../simulation'
import {Process} from '../tasks/process';
import {Entity} from '../model/entity';
import {ISimulation} from '../model/iSimulation';
import {Population,DataSeries,TimeSeries} from '../stats/dataRecorder';
import {DataRecord} from '../stats/dataRecord';
import {Resource} from '../model/resource';
import {AbstractQueue} from '../queues/abstractQueue';

export class Reporter{

    reporter : Function;
    simulation: ISimulation;

    constructor(simulation: ISimulation,reporter : Function = null){
            this.reporter  = reporter || this.defaultReporter;
            this.simulation = simulation;
    }


defaultReporter(message){ 
    console.log(message||"");
}
    
reportRecord(heading:string =null ,statRecord: DataRecord=null ){
    if(statRecord)
    {

        let s = `${heading}      ${statRecord.average.toFixed(4)}       ${statRecord.max.toFixed(2)}        ${statRecord.min.toFixed(2)}        ${statRecord.deviation.toFixed(2)}      ${statRecord.sum.toFixed(2)}`
        
        this.reporter(s);
    }
}

report(){

    this.reporter(`ENTITETER                    average      Max         Min       St.avvik         Sum`)
    this.reporter();
    this.reportEntities();
    this.reporter();
    this.reporter("RESSURSER");
    this.reporter();
    this.reportResources();
    this.reporter();
    this.reporter("PROSESSER");
    this.reporter();

   /* simulation.processes.forEach(process=>{
        this.reportProcess(process);
    })*/
}

reportProcess(process:Process){
    let processQueue = process.queue;

    this.reporter(processQueue.name);
    this.reporter();
    this.reportQueue(processQueue);



}

reportEntities(){
    

    this.simulation.recorder.statistics.entityStats.forEach((entityStats,type)=>{
            this.reporter(type)
            this.reporter();
            this.reportRecord("Antall WIP:              ",entityStats.countStats.sizeSeries.report());
            this.reportRecord("Varighet:                ",entityStats.countStats.durationSeries.report());
           // this.reportRecord("Total tid:    ",entityStats.totalTime.report());
            this.reportRecord( `    VA Tid:    ${entityStats.totalValueAddedTime.toFixed(2)}   ${(entityStats.totalValueAddedTime/entityStats.totalTime.sum).toFixed(2)}`,entityStats.valueAddedTime.report());
            this.reportRecord( `  NVA time:    ${entityStats.totalNonValueAddedTime.toFixed(2)}   ${(entityStats.totalNonValueAddedTime/entityStats.totalTime.sum).toFixed(2)}`,entityStats.nonValueAddedTime.report());
            this.reportRecord( `  Transfer:    ${entityStats.totalTransferTime.toFixed(2)}   ${(entityStats.totalTransferTime/entityStats.totalTime.sum).toFixed(2)}`,entityStats.transferTime.report());
            this.reportRecord( `  Ventetid:    ${entityStats.totalWaitTime.toFixed(2)}   ${(entityStats.totalWaitTime/entityStats.totalTime.sum).toFixed(2)}`,entityStats.waitTime.report());
            this.reportRecord( `     Annet:    ${entityStats.totalOtherTime.toFixed(2)}   ${(entityStats.totalOtherTime/entityStats.totalTime.sum).toFixed(2)}`,entityStats.otherTime.report());
            this.reporter();
            


    });



}


reportResources(){
    

    this.simulation.recorder.statistics.resourceStats.forEach((resourceStats,type)=>{
        this.reporter(type);
        this.reporter();
            this.reportRecord("Antall busy:   ",resourceStats.numberBusy.report());
            this.reportRecord("Antall sche:   ",resourceStats.numberScheduled.report());
            this.reportRecord("Effektiv:      ",resourceStats.instantaneousUtilization.report());
            this.reporter(`       Ideell:                  ${resourceStats.scheduledUtilization.toFixed(4)}`);
            this.reporter();
            this.reporter(`     Total tid:        ${resourceStats.simTime.toFixed(0)}`);
            this.reporter(`         Idle:         ${(resourceStats.totalIdleTime/resourceStats.simTime).toFixed(2)}`);
            this.reporter(`         Busy:         ${(resourceStats.totalBusyTime/resourceStats.simTime).toFixed(2)}`);
            this.reporter(`         Transfer:     ${(resourceStats.totalTransferTime/resourceStats.simTime).toFixed(2)}`);
            this.reporter(`         Broken:       ${(resourceStats.totalBrokenTime/resourceStats.simTime).toFixed(2)}`);
            this.reporter(`         Other:        ${(resourceStats.totalOtherTime/resourceStats.simTime).toFixed(2)}`);
            this.reporter(`         Unscheduled:  ${(resourceStats.totalUnScheduledTime/resourceStats.simTime).toFixed(2)}`);
            this.reporter();

    });


 
}

reportQueue(queue:AbstractQueue<Entity>){

    let recs = queue.report();

    this.reporter(`       Antall kommet : ${queue.countEntered}`);
    this.reporter(`       Antall dratt  : ${queue.countLeft}`);
    this.reporter(`       Antall i kø nå: ${queue.current}`);

this.reportRecord("Køens lengde:",recs.sizeRecord);
this.reportRecord("Tid i køen  :",recs.durationRecord);
}

}