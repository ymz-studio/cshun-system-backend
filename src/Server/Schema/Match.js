const mongoose = require("mongoose");

const { hasRole, isSelf, logined } = require("../Utils/authorizeKit");

const Match = mongoose.model("Match", mongoose.Schema({
  sellerId: mongoose.Types.ObjectId,
  customerId: mongoose.Types.ObjectId,
  matchScore: Number,
  sellerSigned: Boolean,
  customerSigned: Boolean
}));

const decrease = ( x, y ) => x.matchScore < y.matchScore );

module.exports = {
  listAllMatch( $, { req, res } ){
    if( !isLogined( req ) ){
      res.status( 403 ).end();
      return;
    }
    return Match.find({ signed: false });
  },

  listAllSigned( $, { req, res } ){
    if( !isLogined( req ) ){
      res.status( 403 ).end();
      return;
    }
    return Match.find({ signed: true });
  },

  async listTopSellerMatch( { sellerId, num }, { req, res, next } ){
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

  async listTopCustomerMatch( { customerId, num }, { req, res, next } ){
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
