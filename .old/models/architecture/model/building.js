
"use strict";

const ModelBase = require("./modelBase.js");
const Resource = require("./resource.js");


 class Building extends ModelBase  {
     
    
    
    constructor(building){
        
        super(building);
        
        
        this.resources = new Map();
        this.users = new Map();
        
        building.resources.forEach(r=>{
            
            this.resources.set(r.name,new Resource(r));
            
        });
        
    }
    
    getResource(name){
      return  this.resources.get(name);
    }
     
    
    addUser(user){
        this.users.set(user.id,user);
    } 
    
    
    removeUser(user){
        this.users.delete(user.id);
     
    }
 
    
 }
    
    
module.exports = Building;