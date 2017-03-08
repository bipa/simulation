

import {Simulator} from './simulator';


var express = require('express');


 export class SimulationRoutes{


    simulateRoutes;

    constructor(){

        this.simulateRoutes = express.Router();
        this.simulateRoutes.route('/createscenario')
                .post(function(req, res){
                    let scs = req.body;

                    try{

                        let scenario = Simulator.createScenario(scs);
                        res.status(201).send({
                                scenario:scenario,
                                hasError:false
                    });

                    }
                    catch(err){
                    res.status(201).send(err);
                }
            });
        }
    }
 
   
 

   
   