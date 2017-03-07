

import {EntityStats} from './entityStats'
import {DataSeries} from './dataRecorder'



export class ResourceStats extends EntityStats{



    numberBusy:DataSeries;
    numberScheduled:DataSeries;
    instantaneousUtilization:DataSeries;
    _scheduledUtilization : number;

    constructor(type :string){
        super(type);

        this.numberBusy = new DataSeries();
        this.numberScheduled = new DataSeries();
        this.instantaneousUtilization = new DataSeries();

    }



    get scheduledUtilization() : number {

        if(this._scheduledUtilization) return this._scheduledUtilization;
        else{
            let busyRecord  = this.numberBusy.report();
            let numberScheduledRecord  = this.numberScheduled.report()

            this._scheduledUtilization = busyRecord.average/numberScheduledRecord.average; 
            return this._scheduledUtilization;
        }
                
    }
}