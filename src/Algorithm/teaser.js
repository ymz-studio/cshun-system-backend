/*
( a, 200, 10, 10.1 )   ( a,  50, 11 )
( a, 300, 8, 12.30 )   ( b, 0.35, 1800 )
( a, 100, 12, 9.3 )    ( a, 200, 11 )
( b, 3000, 0.3, 7.30 )
*/

const aDay = 1000 * 60 * 60 * 24;
const countUnit = aDay; // the time unit of sell-time
const emergencyTime = 1; // lt this amount must be sell quickly
const highestWeight = 500000;

function minusExp( x ){
  const { E, pow } = Math;
  return pow( E, -x );
}

function scoreTime( timeDiff ){
  return minusExp( timeDiff );
}

module.exports = function countScore( seller, customer ){
  if( seller.signed || customer.signed ){
    // signed match wont get any score
    return -Infinity;
  }

  if( seller.sellType !== customer.buyType ){
    return -Infinity;
  }

  if( seller.amount < customer.amount ){
    return -Infinity;
  }

  if( customer.maxPrice < seller.minPrice ){
    return -Infinity;
  }

  var timeScore;
  const now = Date.now();
  var timeDiff = ( seller.sellDeadline.getTime() - now ) / aDay;
  if( timeDiff <= emergencyTime ){
    timeScore = highestWeight;
  } else {
    timeScore = customer.amount * scoreTime( timeDiff );
  }

  const min = seller.minPrice;
  const max = seller.maxPrice;
  /*
  假设谈妥价格呈现正态分布,那么期望值就是 ( min + max ) / 2
  */
  const expected = ( min + max ) / 2;

  const sellerPriceScore = ( expected - min ) * customer.amount;
  const customerPriceScore = ( max - expected ) * customer.amount;

  const weighted = ( 0.3 * customerPriceScore + 0.7 * sellerPriceScore ) / ( customerPriceScore + sellerPriceScore );

  return timeScore + weighted;
}
