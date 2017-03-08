
import {Simulation} from '../../simulation/simulation';


const {VM} = require('vm2');
const util = require('util')



export class Simulator{




static createScenario(scenario){


                let runtimeModel;
                runtimeModel = Simulator.createModel(scenario.model);
                let rtScenario = {
                    name:scenario.name,
                    runtimeModel:{
                        charts:runtimeModel.charts,
                        variables: runtimeModel.variables,
                        data:runtimeModel.data,
                        preferences:runtimeModel.preferences,
                        simulationRecords:null,
                        logRecords:null
                    }

                }
                var simulation = new Simulation(runtimeModel);
                
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





static createModel(model){
    
    

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





}







