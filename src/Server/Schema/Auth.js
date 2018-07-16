const mongoose = require("mongoose");

const Auth = mongoose.model("Auth", mongoose.Schema({
  certification: String,
  password: String,
  salt: String,
  role: {
    type: String,
    enum: ['admin','seller','customer']
  }
}, {
  timestamps: true
}));

const UserInfo = mongoose.model("UserInfo");

const hmac = require("../../Algorithm/hmac");
const hash = require("../../Algorithm/hash");
const getRandomString = require("../../Algorithm/getRandomString");

const ExpireBST = require("../../DataStructure/ExpireBST");

const {
  __userNotExist__,
  __passwordWrong__,
  __authorizeThrottling__
} = require("../../Constant/SystemCode");

const {
  __passwordRegex__,
  __certificationRegex__
} = require("../../Constant/Regex");

const certificationThrottler = new ExpireBST(
  ( newCert, storedCert ) => {
    return ( "0x" + hash( newCert ) ) - ( "0x" + hash( storedCert ) );
  }
);

module.exports = {
  async authenticate({ authInput }, { req, res , next }){
    req.session.authenticated = "";

    if( !__certificationRegex__.test( certification ) ){
      return res.status( 403 ).end();
    }
    if( !__passwordRegex__.test( password ) ){
      return res.status( 403 ).end();
    }

    const {
      certification,
      password
    } = authInput;
    
    try {
      var auth = await Auth.find({ certification });
    } catch( e ){
      next( e );
      throw "server error";
    }

    if( auth.length === 0 ){
      throw __userNotExist__;
    }

    if( certificationThrottler.touch( certification, 10000 ) > 3 ){
      throw __authorizeThrottling__;
    }

    auth = auth[0];
    let encryptedPassword = hmac( password, auth.salt );

    if( encryptedPassword !== auth.password ){
      throw __passwordWrong__;
    }

    req.session.authenticated = auth._id;
    req.session.role = auth.role;

    try {
      const userInfo = await UserInfo.findById( auth._id );
    } catch( e ){
      next( e );
      throw "server error";
    }
    return userInfo;
  },

  async addNewUser({ authInput, role }, { req, res, next }){
    req.session.authenticated = "";

    const { certification, password } = authInput;

    if( !__certificationRegex__.test( certification ) ){
      return res.status( 403 ).end();
    }
    if( !__passwordRegex__.test( password ) ){
      return res.status( 403 ).end();
    }

    var auth = await Auth.findOne({ certification });
    if( auth.length ){
      throw __userExist__;
    }

    let salt = getRandomString( 16 );
    let encryptedPassword = hmac( password, salt );
    let creation = new Auth({
      certification,
      password: encryptedPassword,
      salt,
      role,
    });

    try {
      auth = await creation.save();
      UserInfo.create({ _id: auth._id });
      req.session.authenticated = auth._id;
      req.session.role = auth.role;
      return auth._id;
    } catch( e ){
      next( e );
      throw "server error";
    }
  },

  logout( $, { req, res }){
    if( !req.session.authenticated ){
      return;
    }
    delete req.session;
    return true;
  }
};
