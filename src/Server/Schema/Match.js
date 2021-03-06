const mongoose = require("mongoose");

const { hasRole, isSelf, logined } = require("../Utils/authorizeKit");

const Match = mongoose.model("Match", mongoose.Schema({
  sellerId: mongoose.Schema.ObjectId,
  customerId: mongoose.Schema.ObjectId,
  matchScore: Number,
  sellerSigned: {
    type: Boolean,
    default: false
  },
  customerSigned: {
    type: Boolean,
    default: false
  }
}));

const decrease = ( x, y ) => x.matchScore < y.matchScore;

module.exports = {
  listAllMatch( $, { req, res } ){
    if( !isLogined( req ) ){
      res.status( 403 ).end();
      return;
    }
    return Match.find({ sellerSigned: false, customerSigned: false });
  },

  listAllSigned( $, { req, res } ){
    if( !isLogined( req ) ){
      res.status( 403 ).end();
      return;
    }
    return Match.find({ sellerSigned: true, customerSigned: true });
  },

  async listTopSellerMatch( { sellerId, num = 3 }, { req, res, next } ){
    if( !isLogined( req ) ){
      res.status( 403 ).end();
      return;
    }

    try {
      const results = await Match.find({ sellerId });
    } catch( e ){
      next( e );
      throw "server error";
    }

    results.sort( decrease );

    const allSigned = results.filter( x => x.sellerSigned );

    allSigned.sort( decrease );

    results.unShift( allSigned );

    return results.slice( 0, num );
  },

  async listTopCustomerMatch( { customerId, num = 3}, { req, res, next } ){
    if( !isLogined( req ) ){
      res.status( 403 ).end();
      return;
    }

    try {
      const results = await Match.find({ customerId });
    } catch( e ){
      next( e );
      throw "server error";
    }

    results.sort( decrease );

    const allSigned = results.filter( x => x.customerSigned );

    allSigned.sort( decrease );

    results.unShift( allSigned );

    return results.slice( 0, num );
  },

  async customerSignMatch({ _id, customerId }){
    if( !isLogined( req ) ){
      res.status( 403 ).end();
      return;
    }

    const result = await Match.findById( _id );

    if( result.customerId === customerId ){
      res.status( 403 ).end();
      return;
    }

    Match.updateOne({ _id }, { customerSigned: true });

    return true;
  },

  async sellerSignMatch({ _id, sellerId }){
    if( !isLogined( req ) ){
      res.status( 403 ).end();
      return;
    }

    const result = await Match.findById( _id );

    if( result.sellerId === sellerId ){
      res.status( 403 ).end();
      return;
    }

    Match.updateOne({ _id }, { sellerSigned: true });

    return true;
  }
}
