const mongoose = require("mongoose");

const { hasRole, isSelf, isLogined } = require("../Utils/authorizeKit");

const UserInfo = mongoose.model("UserInfo");

const Seller = mongoose.model("Seller", mongoose.Schema({
  sellType: String,
  minPrice: Number,
  deadline: Number,
  sellAmount: Number,
  seller: UserInfo.schema
}));

module.exports = {
  listAllSeller( $, { req, res } ){
    if( !isLogined( req ) ){
      res.status( 403 ).end();
      return;
    }
    return Seller.find();
  },

  async addNewSeller( { sellerInput }, { req, res, next } ){
    if( !isLogined( req ) ){
      res.status( 403 ).end();
      return;
    }

    if( !hasRole( req, "admin" ) ){
      throw "没有权限";
    }

    const {
      sellType,
      minPrice,
      deadline,
      sellAmount,
      seller
    } = sellerInput;

    try {
      const res = await Seller.create({
        sellType,
        minPrice,
        deadline,
        sellAmount,
        seller
      });
    } catch( e ){
      next( e );
      throw "server error";
    }

    return res._id;
  },

  async modifySeller({ _id, to }, { req, res, next }) {

    if( !isLogined(req) ){
      return res.status( 403 ).end();
    }

    if( !hasRole( req, "admin" ) || isSelf( req, _id ) ){
      throw "没有权限";
    }

    const {
      sellType,
      minPrice,
      deadline,
      sellAmount,
      seller
    } = to;

    try {
      await Seller.updateOne({ _id }, {
        sellType,
        minPrice,
        deadline,
        sellAmount,
        seller
      });
    } catch( e ){
      next( e );
      throw "server error";
    }

    return true;
  }
}
