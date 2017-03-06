
  
var BaseTask = require("./baseTask.js");   
var SequenceTask = require("./sequenceTask.js");   
var SeizeTask = require("./seizeTask.js");   
var ReleaseTask = require("./releaseTask.js");   
var ServeTask = require("./serveTask.js");   
var util = require("util");
    
        
class SeizeServeReleaseTask extends BaseTask {
        
        
        constructor(ctx,modelItem, server, servicetime,whenDone,whenStarting){
            super(ctx,whenDone,whenStarting);
            
            
            
            this.modelItem = modelItem;
            this.server = server;
            this.seizeTask = new SeizeTask(ctx,modelItem,server);
            this.serveTask = new ServeTask(ctx,modelItem,server,servicetime);
            this.releaseTask = new ReleaseTask(ctx,modelItem,server);
            
            this.sequenceTask = SequenceTask.create(ctx,[this.seizeTask,this.serveTask,this.releaseTask]);
            
            
        }
        
        
        
        
         run(){
               
               
             return  this.sequenceTask.run();
           
        }
        
        
        
        
        
        
        _calculateCompletionTime(){
                
             this._totalCompletion =    this.sequenceTask.completionTime;
            
        }
        
        
        
        
        
        
        
        
        
        static create(ctx,tasks){
            return new SeizeServeReleaseTask(ctx,tasks);
        }
        
        
        seize(task){
            this.tasks.push(task);
            return this;
        }
       
       
       serve(task){
           
            this.tasks.push(task);
            return this;
       }
        
        
        release(task){
            
            this.tasks.push(task);
            return this;
            
        }
        
        
        
        
} 



module.exports=SeizeServeReleaseTask;