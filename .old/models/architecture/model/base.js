const uuid = require("uuid");


 class Base {
     
    
    
    constructor(name=null){
        
        
        this.id  = uuid.v1();
        this.name = name;
    }
    
    
     
     
    }
    
    
module.exports = Base;