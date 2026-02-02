const express = require("express");
const http = require("http"); 
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, { 
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// --- SERVER STATE ---
let elements = []; // Stores the drawing history

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 1. Send existing history to the NEW user only
  io.to(socket.id).emit("load-canvas", elements);

  // 2. Handle Adding Elements (Drawings, Text, Images)
  socket.on("add-element", (data) => {
    elements.push(data);
    // Broadcast to everyone ELSE (so the sender doesn't get a duplicate)
    socket.broadcast.emit("add-element", data);
  });

  // 3. Handle Updating Elements (Moving, Resizing, Text Editing)
  socket.on("update-element", (updatedData) => {
    const index = elements.findIndex((el) => el.id === updatedData.id);
    if (index !== -1) {
      elements[index] = updatedData;
      socket.broadcast.emit("update-element", updatedData);
    }
  });

  // 4. Handle Deleting Elements
  socket.on("delete-element", (id) => {
    elements = elements.filter((el) => el.id !== id);
    socket.broadcast.emit("delete-element", id);
  });

  // 5. Handle Cursor Movement (Real-time Pointers)
  socket.on("cursor-move", (data) => {
    // We don't save cursors in history, just forward them
    socket.broadcast.emit("cursor-move", data);
  });

  // 6. Handle Clear Canvas
  socket.on("clear", () => {
    elements = [];
    io.emit("clear"); // Tell everyone to clear
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {  
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});