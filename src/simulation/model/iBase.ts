
import {Station} from './station';



export interface IBase{
    name:string;
    type:string;
    emitter:any;
    speed: number;
    currentStation:Station;
    timeCreated:number;
    timeDisposed:number;
    lastStateChangedTime:number;
    lastScheduledStateChangedTime :  number ;
}