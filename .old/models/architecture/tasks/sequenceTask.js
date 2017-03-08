
  
var BaseTask = require("./baseTask.js");   
    
        
class SequenceTask extends BaseTask {
        
        
        constructor(ctx,tasks,whenDone,whenStarting){
            super(ctx,whenDone,whenStarting);
            this.tasks= tasks || [];
            
            
            
            
            
        }
        
        
        
        
         innerRun(){
               
               
                this.tasks.forEach(task=>{
                   
                   task.run();
               });
           
        }
        
        
        
        
        
        
       _calculateCompletionTime(){
                
                
                
                
                this.tasks.forEach(task=>{
                   
                   
                   task._delay = this._totalDuration;
                   this._totalDuration += task.completionTime;
               });
                
                
            
        }
        
        
        
        
        
        
        
        
        
        static create(ctx,tasks){
            return new SequenceTask(ctx,tasks);
        }
        
        
        first(task){
            this.tasks.push(task);
            return this;
        }
       
       
       then(task){
           
            this.tasks.push(task);
            return this;
       }
        
        
} 



module.exports=SequenceTask;