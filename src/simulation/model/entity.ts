
import {Resource,ResourceStates} from './resource'
import {Station} from './station'
import {IEntity} from './iEntity'
import {Base} from './base'


export class Entity extends Base{


    finalize:Function;


    transferTime:number=0;
    valueAddedTime:number =0;
    nonValueAddedTime:number =0;
    waitTime:number = 0;
    otherTime:number = 0;


    seizedResources:Resource[];
    runtime :any = {};

    state:EntityStates;

    constructor(entityModel:any){
        super(entityModel);
        this.seizedResources = [];
        this.state = EntityStates.valueAdded;
    }

    releaseResources(resourceState:ResourceStates=ResourceStates.idle){
        for(let resource of this.seizedResources){
            this.releaseResource(resource,resourceState);
        }
    }
    
    seizeResource(resource:Resource){
        this.seizedResources.push(resource);
        resource.seize(this);
    }

    releaseResource(resource:Resource,resourceState:ResourceStates=ResourceStates.idle){
        let index = this.seizedResources.indexOf(resource);
        this.seizedResources.splice(index,1);
        resource.unSeize(this,resourceState);
    }


    private changeState(nextNextState : EntityStates){
        
        if(this.state === nextNextState ) return;
        this.emitter.emit("onBeforeEntityStateChanged", this);
        this.state = nextNextState;
        this.emitter.emit("onAfterEntityStateChanged", this);
    }



    setState(nextNextState : EntityStates =EntityStates.valueAdded){
        
        if(this.state === nextNextState ) return;



          switch (this.state) {
            case EntityStates.nonValueAdded:
                this.emitter.emit("NVA", this);
                break;
            case EntityStates.valueAdded:
                this.emitter.emit("VA", this);
                break;
            case EntityStates.transfer:
                this.emitter.emit("transferTime", this);
                break;
            case EntityStates.other:
                this.emitter.emit("otherTime", this);
                break;
            case EntityStates.wait:
                this.emitter.emit("waitTime", {entity:this,event:"waitTime"});
                break;
        
            default:
                break;
        }
        
        this.changeState(nextNextState);

        switch (nextNextState) {
            case EntityStates.nonValueAdded:
                this.emitter.emit("NVA", this);
                break;
            case EntityStates.valueAdded:
                this.emitter.emit("VA", this);
                break;
            case EntityStates.transfer:
                this.emitter.emit("transfer", this);
                break;
            case EntityStates.other:
                this.emitter.emit("other", this);
                break;
            case EntityStates.wait:
                this.emitter.emit("wait", this);
                break;
        
            default:
                break;
        }





        
    }


 
    
}



export enum EntityStates{

        valueAdded =0,
        nonValueAdded,
        transfer,
        other,
        wait
}