import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(process.env.PORT || 9000, {
  cors: true,
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("userCalling", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("callAccepted", (data) => {
    // Emit a 'callAccepted' event to the specific user identified by 'data.to'
    io.to(data.to).emit("callAcceptedTrue", data);
  });
});

