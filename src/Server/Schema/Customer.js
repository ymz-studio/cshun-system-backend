const mongoose = require("mongoose");

const { hasRole, isSelf, logined } = require("../Utils/authorizeKit");

const UserInfo = mongoose.model("UserInfo");

const Customer = mongoose.model("Customer", mongoose.Schema({
  buyType: String,
  maxPrice: Number,
  buyAmount: Number,
  customer: UserInfo.schema
}));

module.exports = {
  listAllCustomer( $, { req, res }){
    if( !isLogined( req ) ){
      res.status( 403 ).end();
      return;
    }
    return Customer.find();
  },

  async addNewCustomer( { customerInput }, { req, res, next }){
    if( !isLogined(req) ){
      return res.status( 403 ).end();
    }

    if( !hasRole( req, "admin" ) ){
      throw "没有权限";
    }

    const {
      buyType,
      maxPrice,
      buyAmount,
      customer
    } = customerInput;

    try {
      const result = await Customer.create({
        buyType,
        maxPrice,
        buyAmount,
        customer
      });
    } catch( e ){
      next( e );
      throw "server error";
    }

    return result._id;
  },

  async modifyCustomer({ _id, to }){

    if( !isLogined(req) ){
      return res.status( 403 ).end();
    }

    if( !hasRole( req, "admin" ) && !isSelf( req ) ){
      throw "没有权限";
    }

    const {
      buyType,
      maxPrice,
      buyAmount,
      customer
    } = to;

    try {
      await Customer.updateOne( { _id }, {
        buyType,
        maxPrice,
        buyAmount,
        customer
      });
    } catch( e ){
      next( e );
      throw "server error";
    }

    return true;
  }
};
