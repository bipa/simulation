const Event = require("./event.js");


 class RandomEvent extends Event  {
     
    
    
    constructor(randomEvent){
        
        super(randomEvent);
        
        this.dist = randomEvent.dist;
        
    }
    
 }
    
    
    
module.exports = RandomEvent;