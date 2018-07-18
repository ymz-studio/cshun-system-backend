const _ = require("lodash");
const fs = require("fs");
const path = require("path");

const express = require("express");
const https = require("https");
const http = require("http");
const SocketSever = require("socket.io");

const bodyParser = require("body-parser");
const session = require("express-session");
const compression = require("compression");

const mongoose = require("mongoose");

var directConfig;

directConfig = {
  serverConfig: path.resolve( "./src/Server/Config/" )
};

const loadConfig =
  name => require( path.resolve( directConfig.serverConfig, name ) );

loadConfig("./models.js");

const serverConfig = loadConfig("./server");

const publicBase = path.resolve("./public");

const sessionMiddleWare = session( serverConfig.session );

//mongodb connection
{
  let {
    username,
    password,
    host,
    port,
    database,
    options
  } = loadConfig("./database");
  let connection = "mongodb://";
  if( username ){
    connection += username + ":" + password + "@";
  }
  connection += host;
  if( port ){
    connection += ":" + port;
  }

  connection += "/" + database;
  if( _.isObject( options ) ){
    connection += "?" + options
      .entries()
      .reduce( ( acc, [key, value] ) => acc += `${key}=${value}&`, "" );
  } else {
    if( _.isString( options ) ){
      connection += "?" + options;
    }
  }
  mongoose
    .connect( connection )
    .then( $ => console.log(`connect to ${connection} succeed`) )
    .catch( e => {
      console.log( "unable to connect to your mongodL", e.message );
      console.log("running server without database");
  });
}

const app = express();

app.use( bodyParser.json({
  strict: false // directly pass to JSON.parse, no check, to improve perf
}));
console.log("application/json enabled");

app.use( compression( serverConfig.compression ) );
console.log("compression enabled");

app.use( sessionMiddleWare );
console.log("session enabled");

for( let mw of serverConfig.middleWares ){
  app.use( mw );
}
console.log("middleWares loaded");

const routes = loadConfig("./routes");

function __generateRoutes( root ){
  const router = new express.Router();
  for( let [url, route] of Object.entries( root ) ){
    if( _.isObject( route ) && !_.isFunction( route ) && !_.isArray( route ) ){
      if( route.method ){
        router[route.method]( url, route.api );
      } else {
        router.use( url, __generateRoutes( route ) );
      }
    } else {
      router.post( url, route );
    }
  }
  return router;
}

for( let [url, route] of Object.entries( routes ) ){
  if( _.isObject( route ) && !_.isFunction( route ) && !_.isArray( route ) ){
    if( route.method ){
      app[route.method]( url, route.api );
      console.log( url );
    } else {
      app.use( url, __generateRoutes( route ) );
    }
  } else {
    app.post( url, route );
  }
}

console.log("All api loaded and router bootstrap succeed");

var server;
if( serverConfig.https ){
  var ca;
  var key;
  var cert;
  try {
    ca = fs.readFileSync( path.resolve( serverConfig.caFile ) );
    key = fs.readFileSync( path.resolve( serverConfig.keyFile ) );
    cert = fs.readFileSync( path.resolve( serverConfig.certFile ) )
  } catch( e ){
    console.log( "failed loading SSL:", e.message );
  }
  server = https.createServer({
    ca,
    key,
    cert,
    passphrase: serverConfig.passphrase
  }, app );
  console.log("server https enabled");
} else {
  server = http.createServer( app );
  console.log("server running with http");
}

const socketServer = new SocketSever( server );
socketServer.use( ( socket, next ) => {
  sessionMiddleWare( socket.request, socket.request.res, next );
});
console.log("socket server session enabled");

for( let mw of serverConfig.socketMiddleWares ){
  socketServer.use( mw );
}
console.log("socket server middleWares loaded");

loadConfig("./socketServer")( socketServer );
console.log("socket server bootstrap succeed");

//client routing
app.get( "*", ( req, res ) => {
  fs.stat( publicBase + req.path, ( err, stat ) => {
    if( stat && stat.isFile() ){
      return res.sendFile( publicBase + req.path );
    }
    res.sendFile( publicBase + "/index.html" );
  })
});
console.log("client routing enabled");

for( let eH of serverConfig.errorHandlers ){
  app.use( eH );
}
console.log("errorHandlers loaded");

server.listen( serverConfig.port );
console.log(`server bootstrap succeed, running at ${serverConfig.port}`);

//normal http redirect
if( serverConfig.https && serverConfig.redirectToHttps ){
  http.createServer( ( req, res ) => {
    res.writeHead( 301, {
      Location: `https://${req.headers.host}${req.url}:${serverConfig.port}`
    })
    res.end();
  }).listen( 80 );
  console.log(`redirect server bootstrap succeed, running at 80, point to ${serverConfig.port}`);
}
