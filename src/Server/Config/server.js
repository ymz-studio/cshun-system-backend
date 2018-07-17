const path = require("path");

const helmet = require("helmet");
const session = require("express-session");
const RedisStore = require("connect-redis")( session );

const { __maxAge__ } = require("../../Constant/SystemCode");

const basicErrorHandler = require("../MiddleWares/basicErrorHandler");

const bandWidthThrottler = require("../MiddleWares/bandWidthThrottler");

module.exports = {
  https: false,
  port: 80,
  redirectToHttps: false,
  caFile: null,//path.resolve( __dirname, "../SSL/ssl.ca.bundle.pem" ),
  keyFile: null,//path.resolve( __dirname, "../SSL/ssl.key" ),
  certFile: null,//path.resolve( __dirname, "../SSL/ssl.cert.pem" ),
  session: {
    name: "OS_Version_Base64",
    secret: "hifosmsfe",
    resave: false, // if not change, not save
    saveUninitialized: false, // if never used, not save
    store: new RedisStore({
      ttl: __maxAge__
    }),
    unset: "destroy", // delete req.session.prop will clear the store prop
    cookie: {
      maxAge: __maxAge__,
      //domain: "",
      //path: "/",
      sameSite: true,
      httpOnly: true,
      secure: false // only https
    }
  },
  compression: {

  },
  middleWares: [
    helmet(),
    helmet.noCache(),
    //helmet.contentSecurityPolicy({}),
    bandWidthThrottler
  ], // middleWares for all routes
  errorHandlers: [
    basicErrorHandler
  ],
  socketMiddleWares: []
};
