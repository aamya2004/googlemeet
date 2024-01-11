import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: true,
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", (data) => {
    console.log("Call incoming");
    
    // Emit a 'callUser' event to the specific user identified by 'data.userToCall'
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    // Emit a 'callAccepted' event to the specific user identified by 'data.to'
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

const PORT = process.env.PORT || 9000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
