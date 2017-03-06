const Base = require("./base.js");

var Sim  = require("../../../sim/sim.js");

 class Action extends Base  {
     
    
    
    constructor(action){
        
        super(action.name);
        
        this.duration = action.duration;
        this.action = action.action;
    }
    
    
    
    
    
 }
    
    
    
module.exports = Action;