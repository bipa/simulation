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




    //count stats
    countStats:Population;

    constructor(type :string){
        this.type = type;

        this.countStats = new Population();
        this.totalTime = new DataSeries();
        this.transferTime = new DataSeries();
        this.valueAddedTime = new DataSeries();
        this.nonValueAddedTime = new DataSeries();
        this.waitTime = new DataSeries();
        this.otherTime = new DataSeries();
    } 

}