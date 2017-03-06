 
    
    
        
class BaseTask{
        
        
        constructor(ctx,whenDone,whenStarting){
            this.ctx = ctx;
            this._delay= 0;
            this._totalDuration = 0;
            this.whendone = whenDone;
            this.whenStarting = whenStarting;
            
            this._startMessage= null;
            this._endMessage = null;
            
            this._shouldLog = false;
            this._isCalculated  = false;
        }
        
        
        _whenDone(){
            if(this._shouldLog && this._endMessage){
                this.ctx.log(this._endMessage);   
            }
            
           if(this.modelItem) this.modelItem.idleTime =this.ctx.time();
            
            
            if(this.whendone) this.whendone();
        }
        
         _whenStarting(){
            if(this._shouldLog && this._endMessage){
                this.ctx.log(this._startMessage);   
            }
           if(this.modelItem) this.modelItem.idleTime = this.ctx.time()+this.completionTime;
            
            if(this.whenStarting) this.whenStarting();
            
        }
        
        
        innerRun(){
           return  this.ctx.setTimer(this.completionTime).done(this._whenDone,this,this.ctx);
        }
        
        
        run(){
           var completionTime = this.completionTime;
           if(this._shouldLog){
               this.ctx.setTimer(this._delay).done(this._whenStarting,this,this.ctx);
                
           }
           
          this.innerRun();
           
            
        }
    
    
    
    
        _calculateCompletionTime(){
            
        }
    
    
        get completionTime(){
            
            if(!this._isCalculated){
                this._calculateCompletionTime();
                this._isCalculated = true;
            }
            return this._delay+this._totalDuration;
            
            
        }
        
        
        
} 



module.exports=BaseTask;