import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import io from "socket.io-client";

import { decrypt } from "../lib/crypto";
import { getBalance, getNetwork, sendEth } from "../lib/wallet";
import {encryptForPublicKey, decryptWithPrivateKey, deriveSecretKey, publicKeyFromPrivate} from "../lib/e2e";
import { loadChatFromServer, decryptChatHistory } from "../lib/chatHistory";
import { loadContacts, saveContact } from "../lib/contacts";
import TxModal from "../components/TxModel";
import { useApp } from "../context/AppContext";
import { checkChatKey, registerChatKey } from "../lib/joinChat";

const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:4000");

export default function Dashboard() {
  // WALLET STATES
  const {password} = useApp();
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const [network, setNetwork] = useState({});
  const [balance, setBalance] = useState("0");

  const [to, setTo] = useState("");
  const [amt, setAmt] = useState("");

  const [loading, setLoading] = useState(false); // loader
  const [modalData, setModalData] = useState(null); // modal


  // CHAT STATES
  const [contacts, setContacts] = useState([]); // {name, address}
  const [selected, setSelected] = useState(null);
  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState("");
  const scrollRef = useRef();

  // MODAL STATES
  const [showModal, setShowModal] = useState(false);
  const [newContactAddress, setNewContactAddress] = useState("");
  const [newContactName, setNewContactName] = useState("");

  // LOAD WALLET
  async function loadWallet(addr) {
    setBalance(await getBalance(addr));
    setNetwork(await getNetwork());
  }

  useEffect(() => {
   
    const cipher = localStorage.getItem("WALLET_DATA");
    const addr = localStorage.getItem("WALLET_ADDRESS");


    const pk = decrypt(cipher, password);

    setContacts(loadContacts());

    setAddress(addr);
    setPrivateKey(pk);
    loadWallet(addr);
    registerChatKey(pk);

    socket.emit("join", addr);
  }, []);

  // SEND ETH
  async function send() {
  try {
      setLoading(true);
      if(!ethers.isAddress(to)) {
          alert("Invalid recipient address");
          setLoading (false);
          return;
      }
      const amtNum = parseFloat(amt);
      if(isNaN(amtNum) || amtNum <= 0) {
          alert("Invalid amount");
          setLoading (false);
          return;
      }
      if(balance < amtNum )  {
        alert("Insufficient balance");
        setLoading (false);
        return
      }

      const tx = await sendEth(privateKey, to, amt);

      // Modal data
      setModalData({
        status: tx.status === 1 ? "success" : "failed",
        hash: tx.hash,
        from: address,
        to,
        amount: amt,
        txFee: ethers.formatEther((BigInt(tx.gasUsed) * BigInt(tx.gasPrice)).toString()),
      });

      loadWallet(address);
    } catch (err) {
        console.log(err)
      setModalData({
        status: "failed",
        hash: "N/A",
        from: address,
        to,
        amount: amt,
        txFee: "0"
      });
    }
  }

  // SAVE CONTACT
  function addContact() {
    if (!newContactAddress.trim()) {
      alert("Wallet address required");
      return;
    }

    checkChatKey(newContactAddress).then(async (publicKey) => {
      console.log("User chat key exists:", publicKey);
      if (!publicKey) {
        alert("This user has not registered for chat!");
        return;
      }
    
      const ok = saveContact(newContactAddress, newContactName|| "Unnamed",    publicKey);

      if (!ok) {
        alert("Contact already exists!");
        return;
      }

      setContacts(loadContacts());

    });

    // Reset modal
    setNewContactAddress("");
    setNewContactName("");
    setShowModal(false);
  }


//////////////////////////////////////// CHAT LOGIC ////////////////////////////////////////  

async function openChat(contact) {
  setSelected(contact);

  const encrypted = await loadChatFromServer(address, contact.address);
  const decrypted = await decryptChatHistory(contact.publicKey, privateKey, address, encrypted);
  console.log("Decrypted chat history:", decrypted);
  setChat(decrypted);
}

  // SOCKET LISTEN
  useEffect(() => {
    socket.on("message", (m) => {
      if(selected){
        if (m.toAddress === address && m.fromAddress === selected.address) {
          handleIncomingMessage(m);
        }
      }
    });
  }, [address, {...selected}]);


  async function handleIncomingMessage(m) {
    const sender = contacts.find(c => c.address === m.fromAddress);
    const sharedSecret = await deriveSecretKey(privateKey, "04" + sender.publicKey);
    const text = decryptWithPrivateKey(sharedSecret.toString("hex"), m.messageText);
    setChat((prev) => [...prev, { ...m, messageText: text }]);
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  async function sendMessage() {
    if (!selected) return alert("Select a contact");
    if (!msg.trim()) return;

    const sharedSecret = await deriveSecretKey(privateKey, "04" +selected.publicKey);
    const sharedPublic = publicKeyFromPrivate(sharedSecret.toString("hex"));

    const encrypted = await encryptForPublicKey(sharedPublic, msg);
    console.log("Encrypted message:", encrypted);

    const payload = {
      fromAddress: address,
      toAddress: selected.address,
      messageText: encrypted,
      timestamp: new Date().toISOString(),
    };

    socket.emit("send_message", payload);

    setChat((prev) => [...prev, { ...payload, messageText: msg }]);
    setMsg("");
  }

  return (
    <div className="flex h-screen bg-gray-100">

      {/* LEFT HALF: WALLET */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <h1 className="text-2xl font-semibold mb-4">Wallet Dashboard</h1>

        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div><b>Address:</b> {address}</div>
          <div><b>Balance:</b> {balance} ETH</div>
          <div><b>Network:</b> {network.name} (ChainId {network.chainId})</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h2 className="text-lg font-medium mb-3">Send ETH</h2>

          <input
            className="border p-2 rounded w-full mb-2"
            placeholder="Recipient address"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />

          <input
            className="border p-2 rounded w-full mb-2"
            placeholder="Amount In ETH"
            value={amt}
            onChange={(e) => setAmt(e.target.value)}
          />

          <button
            onClick={send}
            disabled={loading}
            className={`w-full py-2 rounded text-white ${
                loading ? "bg-gray-500" : "bg-blue-600"
            }`}
            
          >
              {loading ? "Sending..." : "Send"}
          </button>
        </div>

      </div>
       <TxModal tx={modalData} onClose={() => {
            setModalData(null);
            setLoading(false);
        }} />

      {/* RIGHT HALF: CHAT */}
      <div className="w-1/2 flex bg-white shadow">

        {/* CONTACT LIST SIDEBAR */}
        <div className="w-1/3 border-r p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Contacts</h2>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Add Contact
            </button>
          </div>

          <div className="space-y-2">
            {contacts.map((c, i) => (
              <div
                key={i}
                onClick={() => { openChat(c) }}
                className={`p-2 rounded cursor-pointer ${
                  selected?.address === c.address ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-gray-600">
                  {c.address.slice(0, 12)}...
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className="flex-1 flex flex-col">

          <div className="p-4 border-b">
            {selected ? (
              <h2 className="font-semibold text-lg">
                Chat with {selected.address.slice(0, 12)}...
              </h2>
            ) : (
              <h2 className="font-semibold text-gray-500">
                Select a contact
              </h2>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto">
            {chat.map((m, i) => (
              <div
                key={i}
                className={`p-2 mb-2 rounded max-w-[70%] ${
                  m.fromAddress === address
                    ? "ml-auto bg-blue-200"
                    : "mr-auto bg-gray-200"
                }`}
              >
                {m.messageText}
                <div className="text-[10px] text-gray-500 mt-1">
                  {new Date(m.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div className="p-3 border-t flex gap-2">
              <input
                className="flex-1 border p-2 rounded"
                placeholder="Type a message..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 rounded"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
     

      {/* ADD CONTACT POPUP */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-80">

            <h2 className="text-xl font-semibold mb-4">Add Contact</h2>

            <input
              className="border p-2 rounded w-full mb-3"
              placeholder="Wallet address"
              value={newContactAddress}
              onChange={(e) => setNewContactAddress(e.target.value)}
            />

            <input
              className="border p-2 rounded w-full mb-3"
              placeholder="Nickname (optional)"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={addContact}
                className="px-4 py-2 rounded bg-blue-600 text-white"
              >
                Add
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
