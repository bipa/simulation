

import {EntityStats} from './entityStats'
import {ResourceStats} from './resourceStats'
import {ProcessStats} from './processStats'
import {QueueStats} from './queueStats'
import {DataRecord} from './dataRecord'



export class Statistics {

    entityStats : Map<string,EntityStats>;
    resourceStats: Map<string,ResourceStats>;
    processStats: Map<string,ProcessStats>;
    queueStats: Map<string,QueueStats>;


    constructor(){
            this.entityStats = new Map<string,EntityStats>();
            this.resourceStats = new Map<string,ResourceStats>();
            this.processStats = new Map<string,ProcessStats>();
            this.queueStats = new Map<string,QueueStats>();
    }

    report() : StatisticsRecords{
        let statRecord = new StatisticsRecords();
        this.entityStats.forEach((entityStat,type)=>{
            let entRec = new EntityRecord();
            entRec.type = type;
            let pop= entityStat.countStats.report();
            entRec.count = entityStat.countStats.report();
            entRec.duration = entityStat.totalTime.report();
            entRec.valueAddedTime = entityStat.valueAddedTime.report();
            entRec.nonValueAddedTime = entityStat.nonValueAddedTime.report();
            entRec.transferTime = entityStat.transferTime.report();
            entRec.waitTime = entityStat.waitTime.report();
            entRec.otherTime = entityStat.otherTime.report();

            statRecord.EntityRecords.push(entRec);
        });



          this.resourceStats.forEach((resStat,type)=>{
            let resRec = new ResourceRecord();
            resRec.type = type;
            resRec.numberBusy = resStat.numberBusy.report();
            resRec.numberScheduled = resStat.numberScheduled.report();
            resRec.instantaneousUtilization = resStat.instantaneousUtilization.report();
            resRec.scheduledUtilization = resStat.scheduledUtilization;
            resRec.totalScheduledTime = resStat.totalScheduledTime;
            resRec.totalIdleTime = resStat.totalIdleTime;
            resRec.totalBusyTime = resStat.totalBusyTime;
            resRec.totalTransferTime = resStat.totalTransferTime;
            resRec.totalBrokenTime = resStat.totalBrokenTime;
            resRec.totalOtherTime = resStat.totalOtherTime;

            statRecord.resourceRecords.push(resRec);
        });


        return statRecord;
    }

}


export class StatisticsRecords{
    EntityRecords:EntityRecord[] = [];
    resourceRecords:ResourceRecord[] = [];



}



export class EntityRecord{
    type:string;
    count:DataRecord;
    duration:DataRecord;
    valueAddedTime:DataRecord;
    nonValueAddedTime:DataRecord;
    transferTime:DataRecord;
    waitTime:DataRecord;
    otherTime:DataRecord;

}


export class ResourceRecord{
    type:string;

    numberBusy:DataRecord;
    numberScheduled:DataRecord;
    instantaneousUtilization:DataRecord;
    scheduledUtilization:number;

    totalScheduledTime:number;
    totalIdleTime:number;
    totalBusyTime:number;
    totalTransferTime:number;
    totalBrokenTime:number;
    totalOtherTime:number;

}