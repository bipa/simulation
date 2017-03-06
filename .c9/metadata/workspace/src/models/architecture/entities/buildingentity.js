{"filter":false,"title":"buildingentity.js","tooltip":"/src/models/architecture/entities/buildingentity.js","undoManager":{"mark":76,"position":76,"stack":[[{"start":{"row":0,"column":0},"end":{"row":118,"column":28},"action":"insert","lines":["               ","   ","   ","var Sim  = require(\"../../../sim/sim.js\");","","var User  = require(\"../model/user.js\");",""," ","   ","   ","   ","   ","   ","   ","   ","    class UserEntity extends Sim.Entity {","        constructor(...args) {","          super(...args);","          // the light that is turned on currently","          ","          ","          ","          ","          ","          ","          ","        }","        ","        //this method is only called ONCE per user entity","        start([user,ctx]) {","            ","            //sets the context","            this.ctx = ctx;","          ","            ","            ","            //adds user population stats","            this.ctx.stats.set(user.name,new Sim.Population(`${user.name} population stats`));  ","            ","            ","            ","            this.setNextArrival(user);","        }","        ","        ","        ","        ","        ","        ","        setNextArrival(user){","            ","            ","             let nextCustomerAt = this.ctx.random.exponential (1.0 / this.user.arrival.param1);","             ","             this.setTimer(nextCustomerAt).done(this.createNewUser,this,user);","        }","        ","        ","        ","        ","        ","        ","        createNewUser(user){","            ","            let newUser = new User();","            newUser.createdAt = this.time();","            newUser.name = user.name;","            newUser.onCreation = user.onCreation;","            newUser.onDisposal = user.onDisposal;","            ","            this.setUserDispose(newUser);","            this.ctx.users.set(newUser.id,newUser);","            this.userStats.enter(newUser.createdAt);","            this.ctx.sim.log(`New ${newUser.name} created: Total users: ${this.userStats.current()}`);","            ","            ","            if(newUser.onCreation) newUser.onCreation(newUser,this.ctx);","            ","            ","            ","            ","            ","            this.setNextArrival();","            ","        }","        ","        ","        ","        ","        ","        disposeUser(userToDispose){","            userToDispose.disposedAt = this.time();","            this.ctx.users.delete(userToDispose.id);","            this.ctx.disposedUsers.set(userToDispose.id,userToDispose);","            this.userStats.leave(userToDispose.arrivedAt,userToDispose.disposedAt);","            this.ctx.sim.log(`New ${this.user.name} disposed: Total users: ${this.userStats.current()}`);","            ","            ","            if(userToDispose.onCreation) userToDispose.onDisposal(userToDispose,this.ctx);","            ","            ","        }","        ","        ","        ","        ","        ","        setUserDispose(userToDispose){","            ","             let userDisposeAt = this.ctx.random.triangular(this.user.dispose.param1,this.user.dispose.param2,this.user.dispose.param3)+this.time();","             ","             this.setTimer(userDisposeAt).done(this.disposeUser,this,userToDispose);","        }","        ","    }       ","                         ","                         ","","module.exports = UserEntity;"],"id":1}],[{"start":{"row":5,"column":30},"end":{"row":5,"column":34},"action":"remove","lines":["user"],"id":2},{"start":{"row":5,"column":30},"end":{"row":5,"column":31},"action":"insert","lines":["h"]}],[{"start":{"row":5,"column":31},"end":{"row":5,"column":32},"action":"insert","lines":["o"],"id":3}],[{"start":{"row":5,"column":32},"end":{"row":5,"column":33},"action":"insert","lines":["s"],"id":4}],[{"start":{"row":5,"column":33},"end":{"row":5,"column":34},"action":"insert","lines":["p"],"id":5}],[{"start":{"row":5,"column":34},"end":{"row":5,"column":35},"action":"insert","lines":["i"],"id":6}],[{"start":{"row":5,"column":35},"end":{"row":5,"column":36},"action":"insert","lines":["t"],"id":7}],[{"start":{"row":5,"column":36},"end":{"row":5,"column":37},"action":"insert","lines":["a"],"id":8}],[{"start":{"row":5,"column":37},"end":{"row":5,"column":38},"action":"insert","lines":["l"],"id":9}],[{"start":{"row":15,"column":10},"end":{"row":15,"column":14},"action":"remove","lines":["User"],"id":10},{"start":{"row":15,"column":10},"end":{"row":15,"column":11},"action":"insert","lines":["H"]}],[{"start":{"row":15,"column":11},"end":{"row":15,"column":12},"action":"insert","lines":["o"],"id":11}],[{"start":{"row":15,"column":12},"end":{"row":15,"column":13},"action":"insert","lines":["s"],"id":12}],[{"start":{"row":15,"column":13},"end":{"row":15,"column":14},"action":"insert","lines":["p"],"id":13}],[{"start":{"row":15,"column":14},"end":{"row":15,"column":15},"action":"insert","lines":["i"],"id":14}],[{"start":{"row":15,"column":15},"end":{"row":15,"column":16},"action":"insert","lines":["t"],"id":15}],[{"start":{"row":15,"column":16},"end":{"row":15,"column":17},"action":"insert","lines":["a"],"id":16}],[{"start":{"row":15,"column":17},"end":{"row":15,"column":18},"action":"insert","lines":["l"],"id":17}],[{"start":{"row":29,"column":15},"end":{"row":29,"column":19},"action":"remove","lines":["user"],"id":18},{"start":{"row":29,"column":15},"end":{"row":29,"column":16},"action":"insert","lines":["h"]}],[{"start":{"row":29,"column":16},"end":{"row":29,"column":17},"action":"insert","lines":["o"],"id":19}],[{"start":{"row":29,"column":17},"end":{"row":29,"column":18},"action":"insert","lines":["s"],"id":20}],[{"start":{"row":29,"column":18},"end":{"row":29,"column":19},"action":"insert","lines":["p"],"id":21}],[{"start":{"row":29,"column":19},"end":{"row":29,"column":20},"action":"insert","lines":["i"],"id":22}],[{"start":{"row":29,"column":20},"end":{"row":29,"column":21},"action":"insert","lines":["t"],"id":23}],[{"start":{"row":29,"column":21},"end":{"row":29,"column":22},"action":"insert","lines":["a"],"id":24}],[{"start":{"row":29,"column":22},"end":{"row":29,"column":23},"action":"insert","lines":["l"],"id":25}],[{"start":{"row":46,"column":8},"end":{"row":113,"column":8},"action":"remove","lines":["","        ","        ","        setNextArrival(user){","            ","            ","             let nextCustomerAt = this.ctx.random.exponential (1.0 / this.user.arrival.param1);","             ","             this.setTimer(nextCustomerAt).done(this.createNewUser,this,user);","        }","        ","        ","        ","        ","        ","        ","        createNewUser(user){","            ","            let newUser = new User();","            newUser.createdAt = this.time();","            newUser.name = user.name;","            newUser.onCreation = user.onCreation;","            newUser.onDisposal = user.onDisposal;","            ","            this.setUserDispose(newUser);","            this.ctx.users.set(newUser.id,newUser);","            this.userStats.enter(newUser.createdAt);","            this.ctx.sim.log(`New ${newUser.name} created: Total users: ${this.userStats.current()}`);","            ","            ","            if(newUser.onCreation) newUser.onCreation(newUser,this.ctx);","            ","            ","            ","            ","            ","            this.setNextArrival();","            ","        }","        ","        ","        ","        ","        ","        disposeUser(userToDispose){","            userToDispose.disposedAt = this.time();","            this.ctx.users.delete(userToDispose.id);","            this.ctx.disposedUsers.set(userToDispose.id,userToDispose);","            this.userStats.leave(userToDispose.arrivedAt,userToDispose.disposedAt);","            this.ctx.sim.log(`New ${this.user.name} disposed: Total users: ${this.userStats.current()}`);","            ","            ","            if(userToDispose.onCreation) userToDispose.onDisposal(userToDispose,this.ctx);","            ","            ","        }","        ","        ","        ","        ","        ","        setUserDispose(userToDispose){","            ","             let userDisposeAt = this.ctx.random.triangular(this.user.dispose.param1,this.user.dispose.param2,this.user.dispose.param3)+this.time();","             ","             this.setTimer(userDisposeAt).done(this.disposeUser,this,userToDispose);","        }","        "],"id":26}],[{"start":{"row":51,"column":17},"end":{"row":51,"column":27},"action":"remove","lines":["UserEntity"],"id":27},{"start":{"row":51,"column":17},"end":{"row":51,"column":31},"action":"insert","lines":["HospitalEntity"]}],[{"start":{"row":40,"column":12},"end":{"row":41,"column":38},"action":"remove","lines":["","            this.setNextArrival(user);"],"id":28}],[{"start":{"row":37,"column":12},"end":{"row":37,"column":13},"action":"insert","lines":["/"],"id":29}],[{"start":{"row":37,"column":13},"end":{"row":37,"column":14},"action":"insert","lines":["/"],"id":30}],[{"start":{"row":5,"column":4},"end":{"row":5,"column":8},"action":"remove","lines":["User"],"id":31},{"start":{"row":5,"column":4},"end":{"row":5,"column":5},"action":"insert","lines":["H"]}],[{"start":{"row":5,"column":5},"end":{"row":5,"column":6},"action":"insert","lines":["o"],"id":32}],[{"start":{"row":5,"column":6},"end":{"row":5,"column":7},"action":"insert","lines":["s"],"id":33}],[{"start":{"row":5,"column":7},"end":{"row":5,"column":8},"action":"insert","lines":["p"],"id":34}],[{"start":{"row":5,"column":8},"end":{"row":5,"column":9},"action":"insert","lines":["i"],"id":35}],[{"start":{"row":5,"column":9},"end":{"row":5,"column":10},"action":"insert","lines":["t"],"id":36}],[{"start":{"row":5,"column":10},"end":{"row":5,"column":11},"action":"insert","lines":["a"],"id":37}],[{"start":{"row":5,"column":11},"end":{"row":5,"column":12},"action":"insert","lines":["l"],"id":38}],[{"start":{"row":33,"column":10},"end":{"row":33,"column":12},"action":"insert","lines":["  "],"id":39}],[{"start":{"row":33,"column":12},"end":{"row":33,"column":13},"action":"insert","lines":["t"],"id":40}],[{"start":{"row":33,"column":13},"end":{"row":33,"column":14},"action":"insert","lines":["h"],"id":41}],[{"start":{"row":33,"column":14},"end":{"row":33,"column":15},"action":"insert","lines":["i"],"id":42}],[{"start":{"row":33,"column":15},"end":{"row":33,"column":16},"action":"insert","lines":["s"],"id":43}],[{"start":{"row":33,"column":16},"end":{"row":33,"column":17},"action":"insert","lines":["."],"id":44}],[{"start":{"row":33,"column":17},"end":{"row":33,"column":18},"action":"insert","lines":["c"],"id":45}],[{"start":{"row":33,"column":18},"end":{"row":33,"column":19},"action":"insert","lines":["t"],"id":46}],[{"start":{"row":33,"column":19},"end":{"row":33,"column":20},"action":"insert","lines":["x"],"id":47}],[{"start":{"row":33,"column":20},"end":{"row":33,"column":21},"action":"insert","lines":["."],"id":48}],[{"start":{"row":33,"column":21},"end":{"row":33,"column":22},"action":"insert","lines":["b"],"id":49}],[{"start":{"row":33,"column":22},"end":{"row":33,"column":23},"action":"insert","lines":["u"],"id":50}],[{"start":{"row":33,"column":23},"end":{"row":33,"column":24},"action":"insert","lines":["i"],"id":51}],[{"start":{"row":33,"column":24},"end":{"row":33,"column":25},"action":"insert","lines":["l"],"id":52}],[{"start":{"row":33,"column":25},"end":{"row":33,"column":26},"action":"insert","lines":["s"],"id":53}],[{"start":{"row":33,"column":25},"end":{"row":33,"column":26},"action":"remove","lines":["s"],"id":54}],[{"start":{"row":33,"column":25},"end":{"row":33,"column":26},"action":"insert","lines":["d"],"id":55}],[{"start":{"row":33,"column":26},"end":{"row":33,"column":27},"action":"insert","lines":["i"],"id":56}],[{"start":{"row":33,"column":27},"end":{"row":33,"column":28},"action":"insert","lines":["n"],"id":57}],[{"start":{"row":33,"column":28},"end":{"row":33,"column":29},"action":"insert","lines":["g"],"id":58}],[{"start":{"row":33,"column":29},"end":{"row":33,"column":30},"action":"insert","lines":["s"],"id":59}],[{"start":{"row":33,"column":29},"end":{"row":33,"column":30},"action":"remove","lines":["s"],"id":60}],[{"start":{"row":33,"column":28},"end":{"row":33,"column":29},"action":"remove","lines":["g"],"id":61}],[{"start":{"row":33,"column":27},"end":{"row":33,"column":28},"action":"remove","lines":["n"],"id":62}],[{"start":{"row":33,"column":26},"end":{"row":33,"column":27},"action":"remove","lines":["i"],"id":63}],[{"start":{"row":33,"column":25},"end":{"row":33,"column":26},"action":"remove","lines":["d"],"id":64}],[{"start":{"row":33,"column":24},"end":{"row":33,"column":25},"action":"remove","lines":["l"],"id":65}],[{"start":{"row":33,"column":23},"end":{"row":33,"column":24},"action":"remove","lines":["i"],"id":66}],[{"start":{"row":33,"column":22},"end":{"row":33,"column":23},"action":"remove","lines":["u"],"id":67}],[{"start":{"row":33,"column":21},"end":{"row":33,"column":22},"action":"remove","lines":["b"],"id":68}],[{"start":{"row":33,"column":20},"end":{"row":33,"column":21},"action":"remove","lines":["."],"id":69}],[{"start":{"row":33,"column":19},"end":{"row":33,"column":20},"action":"remove","lines":["x"],"id":70}],[{"start":{"row":33,"column":18},"end":{"row":33,"column":19},"action":"remove","lines":["t"],"id":71}],[{"start":{"row":33,"column":17},"end":{"row":33,"column":18},"action":"remove","lines":["c"],"id":72}],[{"start":{"row":33,"column":16},"end":{"row":33,"column":17},"action":"remove","lines":["."],"id":73}],[{"start":{"row":33,"column":15},"end":{"row":33,"column":16},"action":"remove","lines":["s"],"id":74}],[{"start":{"row":33,"column":14},"end":{"row":33,"column":15},"action":"remove","lines":["i"],"id":75}],[{"start":{"row":33,"column":13},"end":{"row":33,"column":14},"action":"remove","lines":["h"],"id":76}],[{"start":{"row":33,"column":12},"end":{"row":33,"column":13},"action":"remove","lines":["t"],"id":77}]]},"ace":{"folds":[],"scrolltop":0,"scrollleft":0,"selection":{"start":{"row":33,"column":12},"end":{"row":33,"column":12},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":0},"timestamp":1480793551084,"hash":"7306fc8bd62ffb27bdc7bb6ce9639cf5b8b764ca"}