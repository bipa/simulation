               
   
   
var Sim  = require("../../../sim/sim.js");

var User  = require("../model/user.js");

 
   
   
   
   
   
   
   
    class UserEntity extends Sim.Entity {
        constructor(...args) {
          super(...args);
          // the light that is turned on currently
          
          
          
          
          
          
          
        }
        
        //this method is only called ONCE per user entity
        start([user,ctx]) {
            
            //sets the context
            this.ctx = ctx;
            this.user = user;
            
            //adds user population stats
            this.userStats = new Sim.Population(`${this.user.name} population stats`);
            this.ctx.stats.set(this.user.name,this.userStats );  
            
            
            
            this.setNextArrival();
        }
        
        
        
        
        
        
        setNextArrival(){
            
            
             let nextCustomerAt = this.ctx.addRandomValue(this.user.arrivalTime);
             
             this.setTimer(nextCustomerAt).done(this.createNewUser,this,this.user);
        }
        
        
        
        
        
        
        createNewUser(){
            
            let newUser = new User(this.user);
            newUser.createdAt = this.time();
            
            this.ctx.users.set(newUser.id,newUser);
            this.userStats.enter(newUser.createdAt);
            this.ctx.logVerbose(`New ${newUser.name} created: Total users: ${this.userStats.current()}`);
            
            
            if(this.user.onCreation) this.user.onCreation(newUser,this.ctx);
            
            
            
            
            
            this.setNextArrival();
            this.setUserDispose(newUser);
            
        }
        
        
        
        
        
        disposeUser(userToDispose){
            userToDispose.disposedAt = this.time();
            this.ctx.users.delete(userToDispose.id);
            this.ctx.disposedUsers.set(userToDispose.id,userToDispose);
            this.userStats.leave(userToDispose.arrivedAt,userToDispose.disposedAt);
            this.ctx.logVerbose(`New ${this.user.name} disposed: Total users: ${this.userStats.current()}`);
            
            if(this.user.onDisposal) this.user.onDisposal(userToDispose,this.ctx);
            
            
        }
        
        
        
        
        
        setUserDispose(userToDispose){
            
             let userDisposeAt = this.ctx.addRandomValue(this.user.disposalTime);
             
             this.setTimer(userDisposeAt).done(this.disposeUser,this,userToDispose);
        }
        
    }       
                         
                         

module.exports = UserEntity;