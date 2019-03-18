/*
 *  Main project file
 */

// Dependencies
var server = require('./src/server');
// Instantiate application main class
var app = {};

app.init = function(){
  // Initialase and start the server
  server.init();
}

app.init();

// Export application class
module.exports = app;
