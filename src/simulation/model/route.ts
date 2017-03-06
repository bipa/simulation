
import {Station} from './station';






export class Route{
    from: Station;
    to: Station;
    distance : number;
    twoWay : boolean;

    constructor(from:Station, to:Station, distance: number =0, twoWay : boolean = false){
        this.from = from;
        this.to = to;
        this.distance = distance;
        this.from = from;
        this.twoWay = twoWay;
    }
}