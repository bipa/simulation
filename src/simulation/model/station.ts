
import {Resource} from './resource';

export class Station extends Resource{
    tag : any;
    constructor(name : string,tag : any = null){
        super({name:name,type:"station"});
        this.name = name;
        this.tag = tag;
    }
}