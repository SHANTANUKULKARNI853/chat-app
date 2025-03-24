const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // You might want to specify an allowed origin in production
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Routes for authentication (assuming you have an authRoutes file)
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const users = new Map(); // Store username and socket ID pairs

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Listen for user coming online
  socket.on("userOnline", (username) => {
    if (username) {
      // Ensure user doesn't join multiple times
      if (users.has(username)) {
        const existingSocketId = users.get(username);
        if (existingSocketId !== socket.id) {
          io.to(existingSocketId).emit("forceDisconnect");
          users.delete(username);
        }
      }
      users.set(username, socket.id);
      socket.username = username; // Store username on socket
      console.log(`User online: ${username}`);

      // Emit the correct event name "updateStatus"
      io.emit("userStatusChange", { username, isOnline: true });
    }
  });

  // Handle user disconnect
  // Handle user disconnect
socket.on("disconnect", () => {
  const username = socket.username;
  if (username) {
    users.delete(username);
    console.log(`User offline: ${username}`);

    // Notify all clients about the status change
    io.emit("userStatusChange", { username, isOnline: false });
  }
});


  // Handle joining rooms
  socket.on("joinRoom", (roomName) => {
    const usersInRoom = roomName.split("-");
    // Ensure the room doesn't contain the same user twice
    if (usersInRoom[0] === usersInRoom[1]) {
      console.log("Error: Cannot join room with yourself.");
      return;
    }

    socket.join(roomName);
    console.log(`User ${socket.username} joined room: ${roomName}`);

    // Notify all users in the room about the new user
    io.to(roomName).emit("receiveMessage", {
      text: `${socket.username} has joined the chat.`,
      sender: "System",
      timestamp: new Date().toLocaleTimeString(),
    });
  });

  // Handle sending messages
// Handle sending messages
socket.on("sendMessage", (data, callback) => {
  const { sender, recipient, text, roomName } = data;
  io.to(roomName).emit("receiveMessage", {
    sender,
    recipient,
    text,
    timestamp: new Date().toLocaleTimeString(),
  });
  callback({ status: "ok" });
});




  // Handle disconnection
  socket.on("disconnect", () => {
    const username = Array.from(users.entries()).find(([_, id]) => id === socket.id)?.[0];
    if (username) {
      users.delete(username);
      console.log(`${username} disconnected`);
      io.emit("userStatusChange", { username, isOnline: false });

      // Send a disconnect message to all rooms the user was part of
      const rooms = Array.from(socket.rooms).filter((room) => room !== socket.id);
      rooms.forEach((room) => {
        io.to(room).emit("receiveMessage", {
          text: `${username} has left the chat.`,
          sender: "System",
          timestamp: new Date().toLocaleTimeString(),
        });
      });
    }
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("Database connection error:", err));
