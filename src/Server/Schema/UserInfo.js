const mongoose = require("mongoose");

const { hasRole, isSelf, isLogined } = require("../Utils/authorizeKit");

const UserInfo = mongoose.model("UserInfo", mongoose.Schema({
  phone: {
    type: String,
    default: ""
  },
  address: {
    type: String,
    default: ""
  },
  name: {
    type: String,
    default: ""
  },
  idCard: {
    type: String,
    default: ""
  }
}));

module.exports = {
  async me( $, { req, res, next }){
    if( !isLogined( req ) ){
      res.status( 403 ).end();
      return;
    }

    try {
      const userInfo = await UserInfo.find({
        _id: req.session.authenticated
      });
    } catch( e ){
      next( e );
      throw "server error";
    }

    return userInfo;
  },

  async modifyUserInfo({ _id, to }, { req, res, next }){
    if( !req.session.certification ){
      res.status( 403 ).end();
      return;
    }

    if( !hasRole(req, "admin") && !isSelf(req, _id) ){
      throw "没有权限";
    }

    const {
      phone,
      address,
      name,
      idCard
    } = to;

    try {
      UserInfo.updateOne({ _id }, {
        phone,
        address,
        name,
        idCard
      });
    } catch( e ){
      next( e );
      throw "server error";
    }

    return true;
  }
}
