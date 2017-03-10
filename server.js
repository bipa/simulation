




 let SimulationRoutes = require('./simulationRoutes.js');


const  bodyParser = require('body-parser');


 let simulationRoutes = new SimulationRoutes().simulateRoutes;

//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path'); 
var express = require('express');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var app = express();
var server = http.createServer(app);


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.urlencoded({limit: '10mb',extended:true}));
app.use(bodyParser.json({limit: '10mb'}));


app.use(express.static(path.resolve(__dirname, 'client/dist')));

 
app.use('/api/model', simulationRoutes); 

app.get('/api', function(req, res){
    res.send('welcome to my API!');
});











server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});



 