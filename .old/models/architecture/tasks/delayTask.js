
  
var BaseTask = require("./baseTask.js");   
        
class DelayTask extends BaseTask {
        
        
        constructor(ctx,delay,whenDone,whenStarting){
            super(ctx,whenDone,whenStarting);
            
            this.delay = this.ctx.addRandomValue(delay) || 0;
            this._totalDuration = this.delay;
            this._endMessage = `delay of ${this._totalDuration} is done`;
            
        }
        
        
        
        _calculateCompletionTime(){
            
             if(this._releaseTask){
                   this._totalDuration = this._releaseTask._totalDuration;
               }
        }
        
        
     
        
        
        
        
        
        
        static create(ctx,delay){
            return new DelayTask(ctx,delay);
        }
        
        
       
       
       
        
        
} 



module.exports=DelayTask;