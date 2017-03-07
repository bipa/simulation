

import {EntityStats} from './entityStats'
import {ResourceStats} from './resourceStats'
import {ProcessStats} from './processStats'
import {QueueStats} from './queueStats'



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

}