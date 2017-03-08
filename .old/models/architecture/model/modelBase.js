const uuid = require("uuid");
const Base = require("./base.js");

 class ModelBase extends Base{
     
    
    
    constructor(model){
        
        super(model.name);
        // this.model = model;
        // this.plannedEvents = new Map();
        // this.randomEvents = new Map();
        // this.actions = new Map();
        // this.resources = new Map();
        
        // if(model.initModel) model.initModel(this);
    }
    
    
     
    // addPlannedEvent(plannedEvent){
    //     this.plannedEvents.set(plannedEvent.id,plannedEvent);
    // } 
    
    
    // removePlannedEvent(plannedEvent){
    //     this.plannedEvents.delete(plannedEvent.id);
     
    // }
    
    
    // getResource(name){
    //   return  this.resources.get(name);
    // }
    
    // addRandomEvent(randomEvent){
    //     this.randomEvents.set(randomEvent.id,randomEvent);
    // } 
    
    
    // removeRandomEvent(randomEvent){
    //     this.randomEvents.delete(randomEvent.id);
     
    // }
    
    
    // addAction(action){
    //     this.actions.set(action.name,action);
    // } 
    
    
    // removeAction(action){
    //     this.actions.delete(action.name);
     
    // }
    
    
    // fireAction(name,ctx){
    //   this.actions.get(name).fire(this,ctx);
        
    // }
    
     
    }
    
    
module.exports = ModelBase;