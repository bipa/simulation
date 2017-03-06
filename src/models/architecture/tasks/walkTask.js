
let Sim  = require("../../../sim/sim.js");   
let BaseTask  = require("./baseTask.js");   
    
    
        
class WalkTask extends BaseTask{
        
        
        constructor(ctx,from,to,modelItem,speed=1,whenDone,whenStarting){
            super(ctx,whenDone,whenStarting);
            this.to = to;
            this.from = from;
            this.modelItem = modelItem;
            this.speed = modelItem.speed  || speed;
            
            
            
            
            this._startMessage = `${this.modelItem.name} is walking from ${this.from} to ${this.to}`;
            this._endMessage = `${this.modelItem.name} is done walking from ${this.from} to ${this.to}`;
            
            
            
           
            
           
        }
        
        
       _calculateCompletionTime(){
            if(this.from!==this.to){
                    this.route = this.ctx.getRoute(this.from,this.to);
                    if(this.route==null){
                        
                        
            
                        this._startMessage = `ERROR: ${this.modelItem.name} walk from ${this.from} to ${this.to}`;
                        this._endMessage = `ERROR: ${this.modelItem.name} is done walking from ${this.from} to ${this.to}`;
                        this._totalDuration = 0;
                        
                    }
                    else{
                        this._totalDuration= this.route.distance / this.speed;
                        
                    }
                   
            }
       }
        
        _whenStarting(){
            super._whenStarting();
            this.modelItem.isWalking = true;
        }
        
        
        _whenDone(){
            super._whenDone();
            this.modelItem.currentStation = this.to;
            this.modelItem.isWalking = false;
        }
        
        
        
        
        
        // step(route,duration, modelItem,count,currentCount){
            
        //     if(count>=currentCount)
        //     {
        //         this.log(`${modelItem.name} stepping: step ` + currentCount.toFixed(0));
        //         currentCount++;
        //         this.setTimer(duration).done(this.step,this,[route,duration, modelItem,count,currentCount]);
        //     }
            
            
        // }
        
        
        
} 



module.exports=WalkTask;