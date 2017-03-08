
var Sim  = require("../../sim/sim.js");
var argCheck  = require("../../sim/argcheck.js");

var Tasks  = require("./tasks.js");



var BaseEntity  = require("./entities/baseEntity.js");

 


/*class EventRecord{
    simtime;
    eventName;
    comment;
}

class VariableRecord{
    

    simtime;
    variableName;
    value;







}*/






class ArchitectureSimulation {
    
    
    constructor(model){
        
        
        Object.assign(this,model.common);
        
        
       this.simulationRecords = [];
       this.logRecords = [];
        this.sim = new Sim.Sim();
        this.random = new Sim.Random(model.preferences.seed);
        
        //All users that enter the system (not the building)
        this.events = new Map();                  
        this.stats = new Map();
        this.resources = new Map();
        this.modelItems = new Map();
        this.preferences = model.preferences;
        this.constants = Object.assign({},model.constants);
        this.data = Object.assign({},model.data);
        this.variables = {};
        this.createVariables(model.variables,this);
        this.actions = new Map();
        this.stations = new Map();
        this.routes = new Map();
    
        model.entities.forEach(u=>this.sim.addEntity(BaseEntity,u.name,[u,this]));     
                  
        this.generateStations(model); 
                  
        this.generateRoutes(model);          
        
        this.sim.setLogger(function (msg) {
                 console.log(msg);
        });
        
        if(model.onInit) model.onInit(this);
    }
    
    
        addRoute(route, twoWay=true){
            this.routes.set(route.from+route.to,route);
            if(twoWay)
                {
                    let r = {from:route.to,to:route.from,distance:route.distance};
                    this.routes.set(r.from+r.to,r);
                }
                
                
        }
        

        createVariables(variables, ctx){
                for(let variableName in variables) 
                {
                    if(Object.keys(variables[variableName]).length>0)
                    {

                           this.variables[variableName] = {};

                             for(let subVariableName in variables[variableName]) 
                             {
                                 if(variableName=="noLog")
                                 {
                                        this.variables[variableName][subVariableName]=
                                        variables[variableName][subVariableName];
                                 }
                                else{
                                    this.createVariable(this.variables[variableName],
                                    subVariableName,
                                    variables[variableName][subVariableName],ctx)
                                }
                                
                             }
                    }else{
                              this.createVariable(this.variables,
                              variableName,
                              variables[variableName],ctx)
                     }

                   
                }
        }


        createVariable(obj,propName, initValue,ctx){
                let vValue=initValue;
                 Object.defineProperty(
                     obj
                     ,propName
                     ,{
                          get: function() { return vValue; },
                     set: function(value) {
                         vValue = value;
                         ctx.simulationRecords.push(
                             {
                                 simtime:ctx.time(),
                                 name:propName,
                                 value:value
                             }
                         )}
                        }
                )
        }
        
        addStation(station){
            this.stations.set(station.name,station);
           
        }
         
         station(name){
             this.routes.get(name);
        }
        
        
        station(name){
            this.getStation(name);
        }
        
        route(from,to){
            
            return this.getRoute(from,to);
        }
    
        getStation(name){
            return this.stations.get(name);
        }
    
    
        getRoute(from, to){
            
            let routeName = from+to;
            let r =  this.routes.get(routeName);
            return r;
        }
        
        generateRoutes(model){
            model.routes.forEach(route=>this.addRoute(route));
        }
        
         generateStations(model){
            model.stations.forEach(station=>this.addStation(station));
        }
        
   
        initActions(){
            
            this.actions.set("walk",this.walk);
            this.actions.set("serve",this.serve);
            
            
        }          
                  
       setTimer(duration) {
            argCheck(arguments, 1, 1);
        
            const ro = new Sim.Request(
                      this,
                      this.time(),
                      this.time() + duration);
        
            this.sim.queue.insert(ro);
            return ro;
        }
                  
                  
       statistics(name){
              return this.stats.get(name);
        }
                 
                  
                  
        time(){
            return this.sim.time();
        }
                  
                   
       simulate(){
           
            this.sim.simulate(this.preferences.simTime);
       }           
                  
        
        
        logTask(logEvent,msg){
            
           if(logEvent) this.sim.log(`          ${msg}`);
            
        }       
                  
        log(msg){
            let newlogRec = {
                simTime:this.time(),
                name:msg,
                message:msg
            };
            this.logRecords.push(newlogRec);
                 this.sim.log(msg);
        }  
        
        logEvent(msg){
             if(this.preferences.logEvents){
                this.sim.log(msg);
            }
        }
        
        logVerbose(msg){
           
            if(this.preferences.logVerbose){
                this.sim.log(msg);
            }
        }
        
        
        modelItem(id){
            return this.modelItems.get(id);
        }
        
        addModelItem(modelItem,model){
            
            if(Array.isArray(modelItem)){
                modelItem.forEach(mi=>{
                    this.addSingleModelItem(mi,model);
                });
            }
            else{
                this.addSingleModelItem(modelItem,model);
            }
          if(model.creation.onCreateModel) model.creation.onCreateModel(modelItem,this);
          
        }
        
          addSingleModelItem(modelItem,model){
            
             this.modelItems.set(modelItem.id,modelItem);
                
              //Standard
              modelItem.createdAt = this.time();
              this.enter(modelItem.name,modelItem.createdAt);
              this.logVerbose(`New ${modelItem.name} created: Total: ${this.statistics(modelItem.name).current()}`);
          
        }
        
        
        
        removeModelItem(modelItem){
            
            
            
          this.modelItems.delete(modelItem.id);
          this.leave(modelItem.name,modelItem.createdAt,this.time());
          this.logVerbose(`New ${modelItem.name} disposed: Total: ${this.statistics(modelItem.name).current()}`);
            
        }
        
        
        
        resource(name){
            return this.resources.get(name);
        }
        
        addResource(resource){
            this.resources.set(resource.name,resource);
                
            if(resource.hasQueue){
                resource.queue = new Sim.Queue();
                // this.enterEvent = new Sim.Event(`Enter queue due to Resource ${this.name}`);
                // this.leaveEvent = new Sim.Event(`Leave queue due to Resource  ${this.name}`);
            }
        }
        
        
        event(name){
            return this.events.get(name);
        }
        
                  
        addEvent(event){
          this.events.set(event.name,event);
        }     
         
         
          
          
        fireEvent(eventName,sustained=false){
       
         
            let tryEnterHospitalEvent = this.events.get("tryEnterHospital");
            tryEnterHospitalEvent.fire(sustained);
       
       
        }  
          
      
          
          
          enter(name,enterTime){
              this.stats.get(name).enter(enterTime);
          }
          
          leave(name,enterTime,leaveTime){
              this.stats.get(name).leave(enterTime,leaveTime);
          }
          
          
          count(name){
             let s =  this.stats.get(name);
             return s.sizeSeries.count();
          }
          
          avg(name){
              
             let s =  this.stats.get(name);
             return s.durationSeries.average();
          }
    
      
          getEntityByName(name){
              let e = null;
              this.sim.entities.forEach(entity=>{
                  if(entity.name==name){
                      e = entity;
                  } 
              });
              
              return e;
          }
      
      
        addRandomValue(dist){
            
            if(dist===null) return dist;
            
            //if dist is just a number, following the default scale
           // if(!(dist instanceof Object) && !(parseInt(dist).isNaN())) return dist;
            
            let scale = this.setTimeScale(dist.unit);
            let value = null;
            
            if(!dist.name) return dist.value*scale;
            
            if(dist.name=="triangular"){
                value = this.random.triangular(dist.param1*scale,dist.param2*scale,dist.param3*scale);
            }
            else if(dist.name=="exponential"){
                value = this.random.exponential(1.0/(dist.param1*scale));
            }
            
            
            
            return value;
            
            
            
            
            
            
        }
        
        
        //Should be put private
             setTimeScale(scale){
                 
                if(scale=="days"){
                    return 60*24;
                }
                else if(scale=="hours")
                    return 60;
                else
                    return 1;
            }
        
        
        
        
        
walk(from,to,modelItem,whenDone,whenStarting){
          let wt = new Tasks.WalkTask(this,from,to,modelItem,whenDone,whenStarting);
          
         return wt;
}
        
        
sequenceTask()   {
    let st = Tasks.SequenceTask.create(this);
    return st;
}
        
    
        
mnServersTask(simulationItems, servers,servicetime,sortItems,whenDone,whenStarting){
           
           
           
          let mn = new Tasks.MnServersTask(this,simulationItems, servers,servicetime,sortItems,whenDone,whenStarting);
          
          return mn;
} 
        
        
        
        
    }    
        
        
        
 
      
      
                    
             


module.exports.ArchitectureSimulation=ArchitectureSimulation;