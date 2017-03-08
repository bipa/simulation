               
   
   
var Sim  = require("../../../sim/sim.js");


var ModelBase  = require("../model/modelBase.js");
var Action  = require("../model/action.js");

 
   
   
   
   
   
   
   
    class BaseEntity extends Sim.Entity {
        constructor(...args) {
          super(...args);
          // the light that is turned on currently
          
          
          
          
          
          
          
        }
        
        //this method is only called ONCE per user entity
        start([model,ctx]) {
            
            //sets the context
            this.ctx = ctx;
            this.model = model;
            
            
            //Create population stats for this entity
            this.addStats();
            //Add the events in the model to the contexts
            this.addSimulationEvents();
            this.addResources();
            
            this.setConventions();
            this.scheduleNextCreation();
           
            
            
            
        }
        
        

      
      
      scheduleNextCreation(){
          let createAt = this.ctx.addRandomValue(this.model.creation.dist);
          this.setTimer(createAt).done(this.createModel,this,this.model);
      }
      
      
      createModel(){
          
            this.createModelInstance();
          
            if(!this.model.creation.runOnce)
            {
                if(this.model.creation.repeatInterval){
                    
                    let repeatInterval = this.ctx.addRandomValue(this.model.creation.repeatInterval);
                    this.setTimer(repeatInterval).done(this.createModel,this);
                }
                else{
                    this.scheduleNextCreation();
                }
            }
            
      }
      
      
      
      addEvents(modelInstance){
          
          
           //Should be SET AFTER the creation of an element
            if(this.model.plannedEvents)
                this.model.plannedEvents.forEach(plannedEvent=>{
                    
                    // let plannedEvent = new PlannedEvent(e);
                    // this.model.addPlannedEvent(plannedEvent);
                    plannedEvent.logMessage = plannedEvent.logMessage || plannedEvent.name;
                    let startTime = this.ctx.addRandomValue(plannedEvent.dist);
                    this.setTimer(startTime).done(this.schedulePlannedEvent,this,[plannedEvent,modelInstance]);
                    
                });
            
            if(this.model.randomEvents)
                this.model.randomEvents.forEach(randomEvent=>{
                    
                    // let randomEvent = new RandomEvent(e);
                    // this.model.addRandomEvent(randomEvent);
                    randomEvent.logMessage = randomEvent.logMessage || randomEvent.name;
                    if(randomEvent.numberOfRuns)
                    {
                        let next = 0;
                        for (var i = 0; i < randomEvent.numberOfRuns; i++) {
                           
                                next+= this.ctx.addRandomValue(randomEvent.dist);
                                this.setTimer(next).done(this.randomEventOccured,this,[randomEvent,modelInstance]);
                           
                           
                           
                        }
                    }
                    else{
                        let startTime = this.ctx.addRandomValue(randomEvent.dist);
                        this.setTimer(startTime).done(this.scheduleRandomEvent,this,[randomEvent,modelInstance]);
                    }
                    
                    
                    
                    
                });
            
            
            // if(this.model.actions)
            //     this.model.actions.forEach(e=>{
                    
            //         let action = new Action(e);
                    
            //         action.fire = ()=>{
            //             action.action(modelInstance,this.ctx);
            //             let duration = this.ctx.addRandomValue(action.duration);
            //             this.setTimer(duration).done(this.runNextAction,this,action);
            //         };
            //         this.ctx.actions.set(action.name,action);
            //         this.model.addAction(action);
            //         // let startTime = this.ctx.addRandomValue(randomEvent.dist);
            //         // this.setTimer(startTime).done(this.scheduleRandomEvent,this,randomEvent);
                    
            //     });
          
      }
      
        
        runNextAction(action){
            if(action.next){
                //Run the next action
                //Should actually find the action first
                // let nextAction = this.ctx.actions.get(action.next);
                // action.next.fire();
            }
            else{
                //The chain of actions are done-
            }
        }
        
        
        schedulePlannedEvent(plannedEvent,modelInstance){
            
            
            //Schedule the next plannedEvent
            let repeatInterval = this.ctx.addRandomValue(plannedEvent.repeatInterval);
            
            this.setTimer(repeatInterval).done(this.schedulePlannedEvent,this,[plannedEvent,modelInstance]);
            //Log the execution of the planned event
            if(plannedEvent.logEvent) this.ctx.log(plannedEvent.logMessage);
            //Execute the planned event
            plannedEvent.action(modelInstance,this.ctx);
            
            
            
            
        }
        
       scheduleRandomEvent(randomEvent,modelInstance){
            
            //Schedule the next plannedEvent
            let nextEventAt = this.ctx.addRandomValue(randomEvent.dist);
            this.setTimer(nextEventAt).done(this.scheduleRandomEvent,this,[randomEvent,modelInstance]);
          this.randomEventOccured(randomEvent,modelInstance);
            //Execute the planned event
             
            
            
        }
        
        randomEventOccured(randomEvent,modelInstance){
            
            if(randomEvent.logEvent) this.ctx.log(randomEvent.logMessage);
            randomEvent.action(modelInstance,this.ctx);
        }
        
        setConventions(){
          
            if(!this.model.creation){
                this.model.creation = {
                    dist:{
                        value:0
                    },
                    runOnce:true
                };
            }else{
                if(this.model.creation.dist==null) this.model.creation.dist = {value:0};
                if(this.model.creation.runOnce==null) this.model.creation.runOnce = false;
                if(this.model.creation.runBatch==null&&!this.model.creation.batchsize) this.model.creation.batchsize = 1;
                
            }
        }
        
        addStats(){
            
            this.userStats = new Sim.Population(`${this.model.name} population stats`);
            this.ctx.stats.set(this.model.name,this.userStats );  
            
            
        }
        
        
        addResources(){
            if(this.model.resources){
                this.model.resources.forEach(resource=>{
                    this.ctx.addResource(resource);
                }); 
            }
        }
        
        
        addSimulationEvents(){
            
             if(this.model.plannedEvents)
                this.model.plannedEvents.forEach(plannedEvent=>{
                    this.ctx.addEvent(plannedEvent);
                }); 
                
                if(this.model.randomEvents)
                this.model.randomEvents.forEach(randomEvents=>{
                    this.ctx.addEvent(randomEvents);
                });
        
      
            
            
            // if(this.model.actions)
            //     this.model.actions.forEach(e=>{
                    
            //         let action = new Action(e);
                    
            //         action.fire = ()=>{
            //             action.action(modelInstance,this.ctx);
            //             let duration = this.ctx.addRandomValue(action.duration);
            //             this.setTimer(duration).done(this.runNextAction,this,action);
            //         };
            //         this.ctx.actions.set(action.name,action);
            //         this.model.addAction(action);
            //         // let startTime = this.ctx.addRandomValue(randomEvent.dist);
            //         // this.setTimer(startTime).done(this.scheduleRandomEvent,this,randomEvent);
                    
            //     });
            
        }
          createModelInstance(){
            if(this.model.creation.runBatch){
                let modelInstances  = [];
                for (let i = 0; i < this.model.creation.batchSize; i++) {
                    
                   modelInstances.push( this.createSingleItem());
                    
                }
                this.ctx.addModelItem(modelInstances,this.model);
                
            }
            else{
                let modelInstance =  this.createSingleItem();
                  this.ctx.addModelItem(modelInstance,this.model);
            }
            
            
        }
        
        
        
       createSingleItem(){
                 let modelInstance = new ModelBase(this.model);
                  this.addEvents(modelInstance);
                return modelInstance;
            }
    }       
                         
                         

module.exports = BaseEntity;