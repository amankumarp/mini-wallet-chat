const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  fromAddress: { type: String, required: true },
  toAddress: { type: String, required: true },
  messageText: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports =  mongoose.model("Message", MessageSchema);
