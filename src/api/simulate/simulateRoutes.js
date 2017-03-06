
var compile  = require("./simulate.js").compile;
var createModel  = require("./simulate.js").createModel;
var createScenarioes  = require("./simulate.js").createScenarioes;
var createScenario  = require("./simulate.js").createScenario;
var simulate  = require("./simulate.js").simulate;


var express = require('express');


    var simulateRoutes = express.Router();
 simulateRoutes.route('/createscenarioes')
        .post(function(req, res){
            let scs = req.body;

           let scenarioes = createScenarioes(scs);




            res.status(201).send(scenarioes);

        });

    var simulateRoutes = express.Router();
 simulateRoutes.route('/createscenarioe')
        .post(function(req, res){
            let scs = req.body;

            try{

                let scenario = createScenario(scs);
                res.status(201).send({
                        scenario:scenario,
                        hasError:false
            });

            }
            catch(err){
               res.status(201).send(err);
            }





        });


    simulateRoutes.route('/create')
        .post(function(req, res){
            let code = req.body;

           let model = createModel(code);




            res.status(201).send(model);

        });
        
    simulateRoutes.route('/compile').post(function(req, res){
            let code = req.body;

           let model = compile(code.code);




            res.status(201).send(model);

        });
        
        
        
        
        
        
        
        // .get(function(req,res){

        //     var query = {};

        //     if(req.query.genre)
        //     {
        //         query.genre = req.query.genre;
        //     }
        //     Book.find(query, function(err,books){
        //         if(err)
        //             res.status(500).send(err);
        //         else
        //             res.json(books);
        //     });
        // });

    // bookRouter.route('/:bookId')
    //     .get(function(req,res){


    //         Book.findById(req.params.bookId, function(err,book){
    //             if(err)
    //                 res.status(500).send(err);
    //             else
    //                 res.json(book);
    //         });
    //     });

module.exports.simulateRoutes = simulateRoutes;