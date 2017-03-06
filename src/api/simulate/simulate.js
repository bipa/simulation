
const {VM} = require('vm2');

const ArchitectureSimulation  = require("../../models/architecture/architectureSimulation.js").ArchitectureSimulation;
const util = require('util')



function compile(code){
    
    
    const options ={sandbox:{}};
    const vm = new VM(options);
    const fullCode = `let x =${code}
    x`;
    let simulationModel = vm.run(fullCode);
    
    return simulationModel;
}


//   let common = {};
//       ${code.common}
       
//       model.common = common;
       
//       model.variables = ${code.variables}
       
//       model.stations = ${code.stations}
       
//       model.routes = ${code.routes}
       
//       model.preferences = ${code.preferences}

function createScenario(scenario){


                let runtimeModel;
                runtimeModel = createModel2(scenario.model);
                let rtScenario = {
                    name:scenario.name,
                    runtimeModel:{
                        charts:runtimeModel.charts,
                        variables: runtimeModel.variables,
                        data:runtimeModel.data,
                        preferences:runtimeModel.preferences
                    }

                }
                var simulation = new ArchitectureSimulation(runtimeModel);
                
                try{
                    simulation.simulate();

                    rtScenario.runtimeModel.simulationRecords = simulation.simulationRecords;
                    rtScenario.runtimeModel.logRecords = simulation.logRecords;
                    return rtScenario;
                }
                catch(err){

                    throw {
                        hasError:true,error:{
                        type:"Runtime error",
                        message:err.message,
                        stack:err.stack
                    }}
                }

}

function createScenarioes(scenarioes){

    let runtimeScenarioes = [];

    scenarioes.forEach(scenario=>{
        let rt = runtimeModel = createModel2(scenario.model);

        let rtScenario = {
            name:scenario.name,
            runtimeModel:{
                variables: rt.variables,
                data:rt.data
            }

        }

            var simulation = new ArchitectureSimulation(runtimeModel);
            
            simulation.simulate();

            rtScenario.simulationRecords = simulation.simulationRecords;
        
            runtimeScenarioes.push(rtScenario);
    });


    return runtimeScenarioes;
}
function createModel2(model){
    
    

    const options ={sandbox:{}};
    const vm = new VM(options);
    const fullCode = `
       let model = {};
       
       ${model.data.code}
       ${model.variables.code}
       ${model.stations.code}
       ${model.routes.code}
       ${model.entities.code}
       ${model.settings.code}
       ${model.charts.code}

       model.constants = constants;

       model.data = data;
       
       model.variables = variables;
       
       model.stations = stations;
       
       model.routes = routes;
       
       model.entities = entities;
       
       model.preferences = preferences;

       model.charts = charts;
       
       model`;

       try{

            let simulationModel = vm.run(fullCode);
            
            return simulationModel;
       }
       catch(err){
           throw {
                        hasError:true,error:{
                        type:"Syntax error",
                        message:err.message,
                        stack:err.stack
                    }}
       }
    
}
function createModel(code){
    
    

    const options ={sandbox:{}};
    const vm = new VM(options);
    const fullCode = `
       let model = {};
       
       ${code.data}
       ${code.variables}
       ${code.stations}
       ${code.routes}
       ${code.entities}
       ${code.preferences}

       model.constants = constants;

       model.data = data;
       
       model.variables = variables;
       
       model.stations = stations;
       
       model.routes = routes;
       
       model.entities = entities;
       
       model.preferences = preferences;
       
       model`;
    let simulationModel = vm.run(fullCode);
    
    return simulationModel;
}


function simulate(code){
    

    let simulationModel = createModel(code);
    
        console.log(util.inspect(simulationModel,false,null));
    

    var simulation = new ArchitectureSimulation(simulationModel);
    
    simulation.simulate();
    
    
    logResult(simulation);
         
         
}

function logResult (ctx){
  
  
  const lineStats = ctx.bedsResource.queue.report();
  const lineAvgSize = lineStats[0];
  const lineAvgduration = lineStats[1];
  
  
  
  ctx.log(`Patient A`);
  ctx.log('');
                    
  ctx.log(`Count patient A: ${ctx.variables.countPatientA}`);
  ctx.log(`Count in line: ${ctx.variables.countBedsLine}`);
  ctx.log(`Count in bulding: ${ctx.variables.countInBuilding}`);
  ctx.log(`Deaths patient A: ${ctx.variables.deathCountPatientA}`);
  ctx.log(`Deaths in line patient A: ${ctx.variables.deathCountPatientAInLine}`);
  
  
  ctx.log('');
  
  
  ctx.log(`Aukraheimen:`);
  ctx.log('');
  ctx.log(`Avg stay in aukraheimen: ${ctx.avg("aukraheimen").toFixed(0)}`);
  ctx.log(`Avg number in line: ${lineAvgSize.toFixed(0)}`);
  ctx.log(`Avg waiting time in line: ${lineAvgduration.toFixed(0)}`);
  
}




module.exports.compile = compile;
module.exports.createModel = createModel;
module.exports.createScenarioes = createScenarioes;
module.exports.createScenario = createScenario;
module.exports.simulate = simulate;