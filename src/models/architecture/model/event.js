const Base = require("./base.js");

var Sim  = require("../../../sim/sim.js");

 class Event extends Base  {
     
    
    
    constructor(event){
        
        super(event.name);
        
        this.isSustained = event.isSustained;
        this.action = event.action;
        this.event = new Sim.Event(event.name);
        this.logEvent = true;
        this.logMessage = this.name;
    }
    
    
    
    
    
 }
    
    
    
module.exports = Event;