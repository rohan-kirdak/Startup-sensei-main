const onlineUsers = new Map(); // userId -> Set of socket.ids

export const handleChatEvents = (io, socket) => {
  // Register active user for real-time presence
  socket.on("register_user", (userId) => {
    socket.userId = userId;
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    io.emit("update_online_users", Array.from(onlineUsers.keys()));
    console.log(`User registered as online: ${userId}. Current live:`, Array.from(onlineUsers.keys()));
  });

  // Request list of active users on initial load
  socket.on("request_online_users", () => {
    socket.emit("update_online_users", Array.from(onlineUsers.keys()));
  });

  // Join a session room
  socket.on("join_session", (sessionId) => {
    socket.join(sessionId);
    console.log(`${socket.id} joined session: ${sessionId}`);
  });

  // Send a message in a session room
  socket.on("send_message", ({ sessionId, senderId, messageId, message }) => {
    io.to(sessionId).emit("receive_message", {
      sessionId,
      senderId,
      messageId,
      message,
      timestamp: new Date(),
    });
  });

  // Edit a message in a session room
  socket.on("edit_message", ({ sessionId, messageId, message }) => {
    io.to(sessionId).emit("message_edited", {
      sessionId,
      messageId,
      message,
    });
  });

  // Handle read messages receipt
  socket.on("messages_read", ({ sessionId, userId }) => {
    socket.to(sessionId).emit("messages_read", {
      sessionId,
      userId,
    });
  });

  // Typing indicator
  socket.on("typing", ({ sessionId, userId }) => {
    socket.to(sessionId).emit("user_typing", { userId });
  });

  // Clean up user from active presence mapping on socket disconnect
  socket.on("disconnect", () => {
    if (socket.userId && onlineUsers.has(socket.userId)) {
      const sockets = onlineUsers.get(socket.userId);
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(socket.userId);
      }
      io.emit("update_online_users", Array.from(onlineUsers.keys()));
      console.log(`User unregistered on disconnect: ${socket.userId}. Remaining live:`, Array.from(onlineUsers.keys()));
    }
  });
};
