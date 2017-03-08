const Base = require("./base.js");

var Sim  = require("../../../sim/sim.js");

 class Resource extends Base  {
     
    
    
    constructor(resource){
        
        super(resource.name);
        
        this.value = resource.value;
        this.hasQueue = resource.hasQueue;
        
        if(this.hasQueue){
            this.queue = new Sim.Queue();
            this.enterEvent = new Sim.Event(`Enter queue due to Resource ${this.name}`);
            this.leaveEvent = new Sim.Event(`Leave queue due to Resource  ${this.name}`);
        }
        
    }
    
    push(obj,timestamp){
        this.queue.push(obj,timestamp);
    }
     
     
     pop(timestamp){
       return  this.queue.pop(timestamp);
     }
     
    }
    
    
module.exports = Resource;