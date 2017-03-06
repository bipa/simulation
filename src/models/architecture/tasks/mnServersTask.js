
  
var BaseTask = require("./baseTask.js");   
var SeizeServeReleaseTask = require("./seizeServeReleaseTask.js");   
var PriorityQueue= require('es-collections').PriorityQueue; ;
        
class MnServersTask extends BaseTask {
        
        
        constructor(ctx,simulationItems, servers,servicetime,sortItems,whenDone,whenStarting){
            super(ctx,whenDone,whenStarting);
            
            
            
            this.simulationItems = simulationItems;
            this.servers = servers;
            this.servicetime = servicetime;
            this.sortItems = sortItems;
            
            this.serverQueue = new PriorityQueue((s1, s2) => s1.idleTime - s2.idleTime);
            this.initServers();
            this.servers.forEach(s=>{this.serverQueue.add(s);});
          
            this.simulationItems = this.sortSimulationItems();
            
           // this._endMessage = `${this.modelItem.name} has seized ${this.server.name}`;
        
            this.tasks = new Map();
          
            
        }
        
        
        //this function can and will often be overridden
        createTask(item,server)
        {
            return new SeizeServeReleaseTask(this.ctx,item,server,this.servicetime);
        }
        
        
        createTasks(server){
            
              this.simulationItems.forEach(item=>{
                  
                  
                  this.tasks.add(item,this.createTask(item,server));
                  
                  
                  
              });
            
        }
        
        sortSimulationItems(){
            
            if(this.sortItems){
                
                return this.simulationItems.sort(this.sortItems);
                
                
                
            }
            
            return this.simulationItems;
            
            
        }
        
        
        
        initServers(){
              //initialize idleTime
            this.servers.forEach(s=>{
                 if(!s.idleTime){
                    s.idleTime  =this.ctx.time();
                }
            });
        }
        
       
        
        
         innerRun(){
               
               this.simulationItems.forEach(item=>{
            
            //Get the FIRST available server (after sorting)
               let server =  this.serverQueue.remove();
               
               
               
               
               let task = this.tasks.get(item);
              
               
                
                //add server with new idleTime
                this.serverQueue.add(server);
                
              task.run();
                
                
        });
           
        }
        
        
        
        
        
        
       _calculateCompletionTime(){
            
            let max = 0;
            this.simulationItems.forEach(item=>{
                
                //Get the FIRST available server (after sorting)
                   let server =  this.serverQueue.remove();
                   
                   let task = this.createTask(item,server);
                   this.tasks.set(item,task);
                  
                   //set the delay for the task
                   if(this.ctx.time()<server.idleTime)
                   {
                       let delay = server.idleTime - this.ctx.time();
                       task._delay  += delay;
                   }
                   
                   //new idletime...dont include the delay since its baked into idleTime
                   server.idleTime += task._totalDuration;
                    if(max<server.idleTime)
                    {
                        max=server.idleTime;
                    }
                    
                    
                    //add server with new idleTime
                    this.serverQueue.add(server);
                    
                    
                    
            });
            
            
            
             this._totalDuaration  = max - this.ctx.time();
                
                
            
        }
        
        
        
        
        
        
        
        
        
        static create(ctx){
            return new MnServersTask(ctx);
        }
        
        
      
        
        
} 



module.exports=MnServersTask;