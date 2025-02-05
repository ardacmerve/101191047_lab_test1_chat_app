const express = require("express");
const GroupMessage = require("../models/GroupMessage");
const PrivateMessage = require("../models/PrivateMessage");
const router = express.Router();


router.get("/room/:room", async (req, res) => {
    const messages = await GroupMessage.find({ room: req.params.room });
    res.json(messages);
});


router.post("/room", async (req, res) => {
    const { from_user, room, message } = req.body;
    const newMessage = new GroupMessage({ from_user, room, message });
    await newMessage.save();
    res.json(newMessage);
});


router.post("/private", async (req, res) => {
    const { from_user, to_user, message } = req.body;
    const newMessage = new PrivateMessage({ from_user, to_user, message });
    await newMessage.save();
    res.json(newMessage);
});

module.exports = router;
