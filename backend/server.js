const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const Message = require("./models/message");
const EthCrypto = require('eth-crypto');
const User = require("./models/user");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

connectDB();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Handle send_message
  socket.on("send_message", async (msg) => {
    console.log(msg)
    try {
      const message = await Message.create({
        fromAddress: msg.fromAddress,
        toAddress: msg.toAddress,
        messageText: msg.messageText,
        timestamp: msg.timestamp || new Date()
      });

      // Emit to all clients
      io.emit("message", message);
    } catch (err) {
      console.error("Message save error:", err);
    }
  });

  socket.on("fetch_messages", async ({ address }) => {
    try {
      const messages = await Message.find({
        $or: [{ fromAddress: address }, { toAddress: address }]
      }).sort({ timestamp: 1 });

      socket.emit("messages", messages);
    } catch (err) {
      console.error(err);
    }
  });
});

app.post("/chat/register-key", async (req, res) => {
  const { address, publicKey, msgHash, signature } = req.body;
  if (!address || !publicKey || !msgHash || !signature) {
    return res.status(400).send({ error: "invalid" });
  }
  console.log("Register key for address:", req.body);
  // Recover public key/address from signature and msgHash
  try {
    const recoveredPub = EthCrypto.recoverPublicKey(signature, msgHash); // returns 04...
    console.log("Recovered public key:", recoveredPub);
    // derive address from recoveredPub
    const recoveredAddr = EthCrypto.publicKey.toAddress(recoveredPub);
    console.log("Recovered public key:", recoveredAddr);
    if (recoveredAddr.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).send({ error: "signature not matching address" });
    }
    try {
      const existingUser = await User.findOne({address: address.toLowerCase()})
      if (!existingUser) {
        // Create new user
        await User.create({ address: address.toLowerCase(), publicKey, msgHash, signature });
      }
    } catch (e) {
      console.error("User save error:", e);
      return res.status(500).send({ error: "DB error" });
    }
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: "verify failed" });
  }
});

app.get("/chat/pubkey", async (req, res) => {
  const addr = req.query.address?.toLowerCase();
  if (!addr) return res.status(400).send({ error: "address required" });
  const rec = await User.findOne({address: addr})
  if (!rec) return res.status(404).send({ error: "not found" });
  // Return publicKey only (plus optional proof)
  return res.json({ publicKey: rec.publicKey, signature: rec.signature, msgHash: rec.msgHash });
});

app.get("/chat-list/:address", async (req, res) => {
  try {
    const address = req.params.address;
    const messages = await Message.find({
      $or: [{ fromAddress: address }, { toAddress: address }]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.get("/chat/history", async (req, res) => {
  try {
    const user1 = req.query.user1;
    const user2 = req.query.user2;

    if (!user1 || !user2) {
      return res.status(400).json({ error: "Missing user1 or user2" });
    }

    const messages = await Message.find({
      $or: [
        { fromAddress: user1, toAddress: user2 },
        { fromAddress: user2, toAddress: user1 }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);

  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});


const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
