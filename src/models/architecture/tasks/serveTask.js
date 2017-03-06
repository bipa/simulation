
  
var BaseTask = require("./baseTask.js");   
var DelayTask = require("./delayTask.js");   
    
        
class ServeTask extends BaseTask {
        
        
        constructor(ctx,modelItem, server, serviceTime,whenDone,whenStarting){
            super(ctx,whenDone,whenStarting);
            
            
            
            this.modelItem = modelItem;
            this.server = server;
            this.serviceTime = serviceTime;
            this._serveTask = new DelayTask(ctx,serviceTime);
            
            this._startMessage = `${this.server.name} is serving ${this.modelItem.name}`;
            this._endMessage = `${this.server.name} is done serving ${this.modelItem.name}`;
            
        }
        
        
        
        
         innerRun(){
               
               if(this._serveTask){
                   this._serveTask.run();
               }
              else
              {
                  super.run();
              }
              
           
        }
        
        
        
        
        
        
        _calculateCompletionTime(){
               if(this._serveTask){
                   this._totalDuration = this._serveTask._totalDuration;
               }
                
            
        }
        
        
        
        
        
        
        
        
        
        static create(ctx,tasks){
            return new ServeTask(ctx,tasks);
        }
        
        
        serveTask(task){
            this._serveTask = task;
            return this;
        }
       
       
        
        
} 



module.exports=ServeTask;