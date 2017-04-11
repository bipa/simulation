

import {EntityStats} from './entityStats'
import {DataSeries} from './dataRecorder'



export class ResourceStats extends EntityStats{

    currentScheduled: number = 0;
    currentBusy: number =0;


    totalUnScheduledTime:number=0;
    totalScheduledTime : number = 0;
    totalBusyTime : number = 0;
    totalTransferTime : number = 0;
    totalIdleTime: number =0;
    totalBrokenTime : number =0 ;
    totalOtherTime : number = 0;
    totalinActiveTime: number=0;

    averageUnScheduledTime:number=0;
    averageScheduledTime : number = 0;
    averageBusyTime : number = 0;
    averageTransferTime : number = 0;
    averageIdleTime: number =0;
    averageBrokenTime : number =0 ;
    averageOtherTime : number = 0;
    averageinActiveTime: number=0;


    simTime:number;










    numberBusy:DataSeries;
    numberScheduled:DataSeries;
    instantaneousUtilization:DataSeries;

    lastRecordedTime : number =0;
    lastScheduledTime : number =0;

    constructor(type :string){
        super(type);

        this.numberBusy = new DataSeries();
        this.numberScheduled = new DataSeries();
        this.instantaneousUtilization = new DataSeries();

    }

    

    get scheduledUtilization() : number {

            let busyAverage  = this.numberBusy.average;
            let numberScheduledAverage  = this.numberScheduled.average;

            return busyAverage/numberScheduledAverage; 
    }
}

export class ResourceDurations{
    
    unScheduledTime:number=0;
    scheduledTime : number = 0;
    busyTime : number = 0;
    transferTime : number = 0;
    idleTime: number =0;
    brokenTime : number =0 ;
    otherTime : number = 0;
    inActiveTime: number=0;
}