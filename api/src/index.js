const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  socket.on("join", (roomId) => {
    //const selectedRoom = io.sockets.adapter.rooms.get(roomId);
    //console.log("selectedROom", selectedRoom);
    //const numberOfClients = selectedRoom ? selectedRoom.size : 0;
    console.log(roomId);
    console.log("type of roomid ", typeof roomId);
    socket.join(roomId);
    socket.emit("room_join", roomId);
  });
  socket.on("start_call", (roomId) => {
    console.log(`Broadcasting start_call event to peers in room ${roomId}`);
    socket.broadcast.to(roomId).emit("start_call");
  });
  socket.on("webrtc_offer", (event) => {
    console.log(
      `Broadcasting webrtc_offer event to peers in room ${event.roomId}`,
    );
    //console.log(JSON.stringify(event));
    socket.broadcast.to(event.roomId).emit("webrtc_offer", event.offer);
  });
  socket.on("webrtc_answer", (event) => {
    console.log(
      `Broadcasting webrtc_answer event to peers in room ${event.roomId}`,
    );
    console.log("event answer", event.answer);
    socket.broadcast.to(event.roomId).emit("webrtc_answer", event.answer);
    //console.log(JSON.stringify(event));
  });
  socket.on("webrtc_ice_candidate", (event) => {
    console.log(
      `Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId}`,
    );
    socket.broadcast
      .to(event.roomId)
      .emit("webrtc_ice_candidate", event.candidate);
  });
  //socket.on("peer:nego:needed", ({ roomId, offer }) => {
  //  console.log("peer:nego:needed", offer);
  //  io.to(roomId).emit("peer:nego:needed", offer);
  //});

  //socket.on("peer:nego:done", ({ roomId, answer }) => {
  //  console.log("peer:nego:done", answer);
  //  io.to(roomId).emit("peer:nego:final", answer);
  //});
  console.log("a user got connected");
});

httpServer.listen(8080, () => {
  console.log("Server started at 8080 port");
});
