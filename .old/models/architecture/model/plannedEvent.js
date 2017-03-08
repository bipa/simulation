const Event = require("./event.js");


 class PlannedEvent extends Event  {
     
    
    
    constructor(plannedEvent){
        
        super(plannedEvent);
        
        this.start = plannedEvent.start;
        this.repeatInterval = plannedEvent.repeatInterval;
        this.runOnce = plannedEvent.runOnce || false;
        
    }
    
 }
    
    
    
module.exports = PlannedEvent;