
import {Resource} from './resource';

import {Entity} from './entity';
import {Route} from './route';
import {Station} from './station';
import {Recorder} from '../services/recorder';
import {Creator} from '../services/creator';
import {Reporter} from '../services/reporter';
import {Simulator} from '../services/simulator';
import {Units,Distributions,Distribution} from '../stats/distributions';
import {SimEvent,ISimEventResult,ISimEvent} from '../SimEvent';



export interface ISimulation{


    variables:any;
    data:any;

    simTime:number;
    endTime:number;
    eventCount:number;
    currentSimEvent:ISimEvent;

    simulationRecords:any[];
    resources:Resource[];
    entities:Entity[];
    routes:Route[];
    stations:Station[];
    processes:Map<any,any>;

    removeEntity:(e:Entity)=>void;

    entityModels:Map<string,any>;
    log : (a:string,b?:string)=>void;

    finalize:()=>void;
    setConventions:(a:string)=> void;
    addRandomValue:(d:Distribution)=>number;
    scheduleEvent2:(e :ISimEvent,b?: boolean)=>void;
    scheduleEvent:(e :ISimEvent,d?:number,m?:string)=>void;
    setTimer :(d:number,t?:string,m?:string)=>SimEvent<ISimEventResult>;

    recorder:Recorder;
    creator:Creator;
    reporter:Reporter;
    simulator:Simulator;

    eventEmitter:any;
    runtime:any;


    nextStep2 :()=>void;
    route:(t:Station,t2:Station)=>Route;

} 