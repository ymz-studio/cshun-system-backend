module.exports = {
  hasRole( req, role ){
    if( req.session.role === role ){
      return true;
    }
    return false;
  },
  isSelf( req, _id ){
    if( req.session.authenticated === _id ){
      return true;
    }
    return false;
  },
  isLogined( req ){
    if( req.session.authenticated ){
      return true;
    }
    return false;
  }
};
