
import {IBase} from './ibase';


export interface IEntity extends IBase{
    enqueue(timestamp:number);
    dequeue(timestamp:number);
}