

export enum Units{

        Minute =0,
        Seconds,
        Hour,
        Day,
        Week,
        Year
} 


export enum Distributions{

        Constant =0,
        Exponential,
        Triangular
        
} 


export class Distribution{

        type: Distributions;
        value:number;
        param1:number;
        param2:number;
        param3:number;
        unit:Units;        



        constructor(type:Distributions = Distributions.Constant, 
                    scale:Units=Units.Minute,
                    param1:number=0, 
                    param2:number=0, 
                    param3:number=0, 
                    value:number=0) {


            this.type = type;
            this.value=value;
            this.param1 = param1;
            this.param2 = param2;
            this.param3 = param3;


            
        }
}