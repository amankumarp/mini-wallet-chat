const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  address: { type: String, required: true },
  publicKey: { type: String, required: true },
  msgHash: { type: String, required: true },
  signature: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports =  mongoose.model("User", UserSchema);
