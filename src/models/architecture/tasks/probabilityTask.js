
  
var PD = require("probability-distributions");   
var EmptyTask = require("./emptyTask.js");   
var BaseTask = require("./baseTask.js");   
    
        
class ProbabilityTask extends BaseTask{
        
        
        constructor(ctx,probability,whenDone,whenStarting){
            super(ctx,whenDone,whenStarting);
            this.probability= probability;
            
             let sampleProb = PD.rbinom(1,1,this.probability);
            this.success =  sampleProb[0] == 1;
            
            
            this._successTask =new EmptyTask(ctx);
            this._failureTask =new EmptyTask(ctx);
            
        }
        
        
        
          
         innerRun(){
               
           
           
            if(this.success)
            {
               this._successTask.run();
            }
            else{
                
              this._failureTask.run();
            }
           
           
           
           
           
        }
        
        
        
        
        
       _calculateCompletionTime(){
                
                
            if(this.success)
            {
                this._totalDuration = this._successTask();
            }
            else{
                
                this._totalDuration = this._failureTask();
            }
           
            
        }
        
        
        
        static create(ctx,probability){
            return new ProbabilityTask(ctx,probability);
        }
        
        successTask(task){
            this._successTask=task;
            return this;
        }
        
        
        failureTask(task){
            this._failureTask=task;
            return this;
        }
        
        
        
} 



module.exports=ProbabilityTask;