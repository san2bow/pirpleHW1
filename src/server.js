/*
 *  HTTP/HTTPS Server library
 */

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var fs = require('fs');
var StringDecoder = require('string_decoder').StringDecoder;

var config = require('./../config');

// Instantiate application main class
var server = {};

// Initialase and start the server
server.init = function(){
  console.log(`${Date.now()}: HTTP/HTTPS Server started`);

  // Instantiate the HTTP server
  var httpServer = http.createServer(function(req, res){
    server.unifiedServer(req,res); 
  });
  
  // Start HTTP server
  httpServer.listen(config.httpPort, function(){
    console.log(`${Date.now()}: The HTTP server is listening on port ${config.httpPort} in ${config.envName} mode`);
  });
  
  // Instatiate the HTTPS server
  var httpsServerOption = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
  };
  var httpsServer = https.createServer(httpsServerOption, function(req,res){
    server.unifiedServer(req,res); 
  });
  // Start HTTPS server
  httpsServer.listen(config.httpsPort, function(){
    console.log(`${Date.now()}: The HTTPS server is listening on port ${config.httpsPort} in ${config.envName} mode`);
  });
}

server.unifiedServer = function(req,res){
  console.log('Uni func executed');
  // Get the URL and parse it
  var parsedUrl = url.parse(req.url, true);
  
  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');
  
  // Get the query string as an object
  var queryStringObject = parsedUrl.query;
  
  // Get the HTTP method
  var method = req.method.toLowerCase();
  
  // Get the headers as an object
  var headers = req.headers;
  
  // Get the payload, if any 
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', function(data){
      buffer += decoder.write(data); 
  });
  req.on('end', function(){
    buffer +=decoder.end();
        
    // Choose the handler this request should go to. If one is not found use the notFound handler
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
        
    // Construct the data object to send to the handler
    var data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer,
    }
        
    // Route the request to the handler specified in the router
    chosenHandler(data, function(statusCode, payload){
      // Use the status code called back by the handler or default
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      
      // Use the payload called back by the handler or default
      payload = typeof(payload) == 'object' ? payload : {};
      
      // Conver the payload to a string
      var payloadString = JSON.stringify(payload);
      
      // Retern the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      
      console.log(`${Date.now()}: Returning this response: `, statusCode, payload);
    });
  });
};  

// Define handlers
var handlers = {};

// Sample handlers
handlers.hello = function(data, callback){
    // Callback a http status code, and a payload object
    callback(200, {'message': 'Hello World!'});
};

// Not found handler
handlers.notFound = function(data, callback){
    callback(404);
};

// Define a request router
var router = {
  'hello': handlers.hello
}


// Export server class
module.exports = server;
