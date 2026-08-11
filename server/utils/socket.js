let io;

module.exports = {
  init: (httpServer) => {
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
      cors: {
        origin: (origin, callback) => callback(null, true),
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
      }
    });

    // Add JWT Authentication Middleware
    io.use((socket, next) => {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) {
        return next(new Error('Authentication error: No cookie provided'));
      }
      try {
        const cookie = require('cookie');
        const cookies = cookie.parse(cookieHeader);
        const token = cookies.token;
        if (!token || token === 'none') {
          return next(new Error('Authentication error: No token provided'));
        }
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; // Attach user info to socket
        next();
      } catch (err) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  }
};
