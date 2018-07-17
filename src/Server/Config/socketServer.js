const {
  __authorizeEventName__
} = require("../../Constant/SocketEventName");

var cache = [];
module.exports = socketServer => {
  socketServer.on( "connection", ( socket ) => {

    socket.on( __authorizeEventName__.checkAuthState, ack => {
      if( !req.session ){
        ack( false );
        return;
      }
      ack( req.session.authenticated );
    })
  });
}
