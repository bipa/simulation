

import {EntityStats} from './entityStats'



export class ResourceStat extends EntityStats{



    countBusy:number;
    

    constructor(type :string){
        super(type);
    }

}