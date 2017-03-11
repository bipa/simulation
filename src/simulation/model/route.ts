
import {Station} from './station';





export class Route{
    from: Station;
    to: Station;
    distance : number;
    twoWay : boolean;
    id:any;

    constructor(from:Station, to:Station, distance: number =0, twoWay : boolean = true){
        this.from = from;
        this.to = to;
        this.distance = distance || 0;
        this.twoWay = twoWay || true;
    }
}