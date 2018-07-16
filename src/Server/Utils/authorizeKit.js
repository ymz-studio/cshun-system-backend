module.exports = {
  hasRole( req, role ){
    if( req.session.role === role ){
      return true;
    }
  },
  isSelf( req, _id ){
    if( req.session.authenticated === _id ){
      return true;
    }
  },
  isLogined( req ){
    if( req.session.authenticated ){
      return true;
    }
  }
};
