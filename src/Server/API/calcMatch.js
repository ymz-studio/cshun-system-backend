const mongoose = require("mongoose");
const countScore = require("../../Algorithm/teaser.js");

const Seller = mongoose.model("Seller");
const Customer = mongoose.model("Customer");
const Match = mongoose.model("Match");

async function countEachPair(){
  const sellers = Seller.find();
  const customers = Customer.find();
  const promises = [];

  for( let seller of sellers ){
    for( let customer of customers ){
      let sellerId = seller._id;
      let customerId = customer._id;
      let promise;
      let matchScore = countScore( seller, customer );
      let result = await Match.find({ sellerId, customerId });
      if( result.length !== 0 ){
        promise = Match.update({ sellerId, customerId }, { matchScore });
      } else {
        promise = Match.create({
          sellerId,
          customerId,
          matchScore
        });
      }
      promises.push( promise );
    }
  }

  try {
    await Promise.all( promises );
  } catch( e ){
    throw "err during saving values"
  };
}

module.exports = countEachPair;
