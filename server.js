require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "views")));


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("MongoDB Connection Error:", err));


const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"));
});


io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    socket.on("joinRoom", (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
        io.to(room).emit("receiveMessage", { from_user: "System", message: `A new user joined ${room}` });
    });

    socket.on("sendMessage", async (data) => {
        const { from_user, room, message } = data;
        io.to(room).emit("receiveMessage", { from_user, message });

        
        const GroupMessage = require("./models/GroupMessage");
        const newMessage = new GroupMessage({ from_user, room, message });
        await newMessage.save();
    });

    socket.on("typing", (data) => {
        socket.to(data.room).emit("userTyping", { user: data.user });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
