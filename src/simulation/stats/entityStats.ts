

export class EntityStats{


    type:string;
    //Time Stats
    totalTime:number=0;
    transferTime:number=0;
    valueAddedTime:number=0;
    nonValueAddedTime:number=0;
    waitTime:number=0;
    otherTime:number=0;

    //count stats
    numberIn:number=0;
    numberOut:number=0;

    constructor(type :string){
        this.type = type;
    } 

}