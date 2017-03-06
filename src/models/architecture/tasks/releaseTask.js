
  
var BaseTask = require("./baseTask.js");   
var EmptyTask = require("./emptyTask.js");   
    
        
class ReleaseTask extends BaseTask {
        
        
        constructor(ctx,modelItem, server,whenDone,whenStarting){
            super(ctx,whenDone,whenStarting);
            
            
            
            this.modelItem = modelItem;
            this.server = server;
            
            this._releaseTask = new EmptyTask(ctx);
            
            this._endMessage = `${this.modelItem.name} has released ${this.server.name}`;
            
        }
        
        
        
        
         innerRun(){
               
               if(this._releaseTask){
                   this._releaseTask.innerRun();
               }
              else
              {
                  super.innerRun();
              }
              
           
        }
        
        
        
        
        
        
        _calculateCompletionTime(){
               if(this._releaseTask){
                   this._totalDuration = this._releaseTask._totalDuration;
               }
                
                
            
        }
        
        
        
        
        
        
        
        
        
        static create(ctx,tasks){
            return new ReleaseTask(ctx,tasks);
        }
        
        
        releaseTask(task){
            this._releaseTask = task;
            return this;
        }
       
       
        
        
} 



module.exports=ReleaseTask;