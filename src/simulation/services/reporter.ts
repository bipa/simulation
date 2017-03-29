

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

        let s = `${heading}      ${statRecord.count.toFixed(0)}      ${statRecord.average.toFixed(2)}       ${statRecord.max.toFixed(2)}        ${statRecord.min.toFixed(2)}        ${statRecord.deviation.toFixed(2)}      ${statRecord.sum.toFixed(2)}`
        
        this.reporter(s);
    }else{
          let s = `${heading}`
        
        this.reporter(s);
    }
}

report(){

    this.reporter(`ENTITETER                    count       average      Max         Min       St.avvik         Sum`)
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
            this.reportRecord("Antall WIP:               ",entityStats.countStats.report());
            this.reportRecord("Syklustid:                ",entityStats.totalTime.report());
            
            this.reporter();
            this.reportRecord(`Total tid:    ${entityStats.totTime.toFixed(2)}`);
            this.reporter();
            /*this.reportRecord( `    VA Tid:    ${entityStats.totalValueAddedTime.toFixed(2)}   ${(entityStats.totalValueAddedTime/entityStats.totTime).toFixed(2)}`,entityStats.valueAddedTime.report());
            this.reportRecord( `  NVA time:    ${entityStats.totalNonValueAddedTime.toFixed(2)}   ${(entityStats.totalNonValueAddedTime/entityStats.totTime).toFixed(2)}`,entityStats.nonValueAddedTime.report());
            this.reportRecord( `  Transfer:    ${entityStats.totalTransferTime.toFixed(2)}   ${(entityStats.totalTransferTime/entityStats.totTime).toFixed(2)}`,entityStats.transferTime.report());
            this.reportRecord( `  Ventetid:    ${entityStats.totalWaitTime.toFixed(2)}   ${(entityStats.totalWaitTime/entityStats.totTime).toFixed(2)}`,entityStats.waitTime.report());
            this.reportRecord( `     Annet:    ${entityStats.totalOtherTime.toFixed(2)}   ${(entityStats.totalOtherTime/entityStats.totTime).toFixed(2)}`,entityStats.otherTime.report());
            this.reporter();*/
            
            this.reportRecord( `    VA Tid:    ${entityStats.totalValueAddedTime.toFixed(2)}   ${(entityStats.totalValueAddedTime/entityStats.totTime).toFixed(2)}`);
            this.reportRecord( `  NVA time:    ${entityStats.totalNonValueAddedTime.toFixed(2)}      ${(entityStats.totalNonValueAddedTime/entityStats.totTime).toFixed(2)}`);
            this.reportRecord( `  Transfer:    ${entityStats.totalTransferTime.toFixed(2)}     ${(entityStats.totalTransferTime/entityStats.totTime).toFixed(2)}`);
            this.reportRecord( `  Ventetid:    ${entityStats.totalWaitTime.toFixed(2)}      ${(entityStats.totalWaitTime/entityStats.totTime).toFixed(2)}`);
            this.reportRecord( `     Annet:    ${entityStats.totalOtherTime.toFixed(2)}      ${(entityStats.totalOtherTime/entityStats.totTime).toFixed(2)}`);
            this.reporter();

    });



}


reportResources(){
    

    this.simulation.recorder.statistics.resourceStats.forEach((resourceStats,type)=>{
        this.reporter(type);
        this.reporter();
          /*  this.reportRecord("Antall busy:   ",resourceStats.numberBusy.report());
            this.reportRecord("Antall sche:   ",resourceStats.numberScheduled.report());
            this.reportRecord("Effektiv:      ",resourceStats.instantaneousUtilization.report());
            this.reporter(`       Ideell:                  ${resourceStats.scheduledUtilization.toFixed(4)}`);*/
            this.reporter();
            this.reporter(`     Total tid:        ${resourceStats.totalScheduledTime.toFixed(0)}`);
            this.reporter(`         Idle:         ${(resourceStats.totalIdleTime/resourceStats.totalScheduledTime).toFixed(2)}`);
            this.reporter(`         Busy:         ${(resourceStats.totalBusyTime/resourceStats.totalScheduledTime).toFixed(2)}`);
            this.reporter(`     inactive:         ${(resourceStats.totalinActiveTime/resourceStats.totalScheduledTime).toFixed(2)}`);
            this.reporter(`         Wait:         ${(resourceStats.totalWaitTime/resourceStats.totalScheduledTime).toFixed(2)}`);
            this.reporter(`         Transfer:     ${(resourceStats.totalTransferTime/resourceStats.totalScheduledTime).toFixed(2)}`);
            this.reporter(`         Broken:       ${(resourceStats.totalBrokenTime/resourceStats.totalScheduledTime).toFixed(2)}`);
            this.reporter(`         Other:        ${(resourceStats.totalOtherTime/resourceStats.totalScheduledTime).toFixed(2)}`);
            this.reporter(`         Unscheduled:  ${(resourceStats.totalUnScheduledTime/resourceStats.totalScheduledTime).toFixed(2)}`);
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