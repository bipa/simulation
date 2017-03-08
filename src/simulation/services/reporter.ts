

import {Simulation} from '../simulation'
import {Process} from '../tasks/process';
import {Entity} from '../model/entity';
import {Population,DataSeries,TimeSeries} from '../stats/dataRecorder';
import {DataRecord} from '../stats/dataRecord';
import {Resource} from '../model/resource';
import {AbstractQueue} from '../queues/abstractQueue';

export class Reporter{

    reporter : Function;

    constructor(reporter : Function = null){
            this.reporter  = reporter || this.defaultReporter;
    }


defaultReporter(message){ 
    console.log(message||"");
}
    
reportRecord(heading:string =null ,statRecord: DataRecord=null ){
    if(statRecord)
    {

        let s = `       ${heading}          ${statRecord.average.toFixed(4)}       ${statRecord.max.toFixed(2)}        ${statRecord.min.toFixed(2)}        ${statRecord.deviation.toFixed(2)}      ${statRecord.sum.toFixed(2)}`
        
        this.reporter(s);
    }
}

report(simulation: Simulation){

    this.reporter(`ENTITETER                    average      Max         Min       St.avvik         Sum`)
    this.reporter();
    this.reportEntities(simulation);
    this.reporter();
    this.reporter("RESSURSER");
    this.reporter();
    this.reportResources(simulation);
    this.reporter();
    this.reporter("PROSESSER");
    this.reporter();

    simulation.processes.forEach(process=>{
        this.reportProcess(process);
    })
}

reportProcess(process:Process){
    let processQueue = process.queue;

    this.reporter(processQueue.name);
    this.reporter();
    this.reportQueue(processQueue);



}

reportEntities(simulation:Simulation){
    

    simulation.recorder.statistics.entityStats.forEach((entityStats,type)=>{
            this.reporter(type)
            this.reporter();
            this.reportRecord("Antall WIP:   ",entityStats.countStats.sizeSeries.report());
            this.reportRecord("Varighet:     ",entityStats.countStats.durationSeries.report());
            this.reportRecord("Total tid:    ",entityStats.totalTime.report());
            this.reportRecord("   VA Tid:    ",entityStats.valueAddedTime.report());
            this.reportRecord("   NVA time:  ",entityStats.nonValueAddedTime.report());
            this.reportRecord("   Transfer:  ",entityStats.transferTime.report());
            this.reportRecord("   Ventetid:  ",entityStats.waitTime.report());
            this.reportRecord("   Annet:     ",entityStats.otherTime.report());
            this.reporter();
            


    });



}


reportResources(simulation:Simulation){
    

    simulation.recorder.statistics.resourceStats.forEach((resourceStats,type)=>{
        this.reporter(type);
        this.reporter();
            this.reportRecord("Antall busy:   ",resourceStats.numberBusy.report());
            this.reportRecord("Antall sche:   ",resourceStats.numberScheduled.report());
            this.reportRecord("Effektiv:      ",resourceStats.instantaneousUtilization.report());
            this.reporter(`       Ideell:                  ${resourceStats.scheduledUtilization.toFixed(4)}`);
            this.reporter();
            this.reporter(`     Total tid:        ${resourceStats.totalScheduledTime.toFixed(0)}`);
            this.reporter(`         Idle:         ${(resourceStats.totalIdleTime/resourceStats.totalScheduledTime).toFixed(2)}`);
            this.reporter(`         Busy:         ${(resourceStats.totalBusyTime/resourceStats.totalScheduledTime).toFixed(2)}`);
            this.reporter(`         Transfer:     ${(resourceStats.totalTransferTime/resourceStats.totalScheduledTime).toFixed(2)}`);
            this.reporter(`         Broken:       ${(resourceStats.totalBrokenTime/resourceStats.totalScheduledTime).toFixed(2)}`);
            this.reporter(`         Other:        ${(resourceStats.totalOtherTime/resourceStats.totalScheduledTime).toFixed(2)}`);
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