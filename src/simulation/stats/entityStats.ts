import {Population,DataSeries,TimeSeries} from './dataRecorder';

export class EntityStats{


    type:string;
    //Time Stats
    totalTime:DataSeries;
    transferTime:DataSeries;
    valueAddedTime:DataSeries;
    nonValueAddedTime:DataSeries;
    waitTime:DataSeries;
    otherTime:DataSeries;

    totalWaitTime:number=0;
    totalValueAddedTime:number =0;
    totalNonValueAddedTime: number=0;
    totalTransferTime:number=0;
    totalOtherTime:number=0;

    
    averageWaitTime:number=0;
    averageValueAddedTime:number =0;
    averageNonValueAddedTime: number=0;
    averageTransferTime:number=0;
    averageOtherTime:number=0;

    count:number=0;

    totTime:number=0;

    //count stats
    countStats:DataSeries;

    constructor(type :string){
        this.type = type;

        this.countStats = new DataSeries();
        this.totalTime = new DataSeries();
        this.transferTime = new DataSeries();
        this.valueAddedTime = new DataSeries();
        this.nonValueAddedTime = new DataSeries();
        this.waitTime = new DataSeries();
        this.otherTime = new DataSeries();
    } 

} 


export class EntityDurations{
    waitTime:number=0;
    valueAddedTime:number =0;
    nonValueAddedTime: number=0;
    transferTime:number=0;
    otherTime:number=0;
}