
  
var BaseTask = require("./baseTask.js");   
var EmptyTask = require("./emptyTask.js");   
    
        
class SeizeTask extends BaseTask {
        
        
        constructor(ctx,simulationItem, server,whenDone,whenStarting){
            super(ctx,whenDone,whenStarting);
            
            
            
            this.simulationItem = simulationItem;
            this.server = server;
            
            this._seizeTask = new EmptyTask(ctx);
            
            this._endMessage = `${this.simulationItem.name} has seized ${this.server.name}`;
            
            
            
        }
        
        
        
        
         innerRun(){
               
               if(this._seizeTask){
                   this._seizeTask.run();
               }
              else
              {
                  super.run();
              }
              
           
        }
        
        
        
        
        
        
        _calculateCompletionTime(){
               if(this._seizeTask){
                   this._totalDuration = this._seizeTask._totalDuration;
               }
                
                
            
        }
        
        
        
        
        
        
        
        
        
        static create(ctx,tasks){
            return new SeizeTask(ctx,tasks);
        }
        
        
        seizeTask(task){
            this._seizeTask = task;
            return this;
        }
       
       
        
        
} 



module.exports=SeizeTask;