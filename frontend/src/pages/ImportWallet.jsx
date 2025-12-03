import { useState } from "react";
import { importWallet } from "../lib/wallet";
import { encrypt } from "../lib/crypto";
import { Link , useNavigate} from 'react-router-dom';
import { useApp } from "../context/AppContext";

export default function ImportWallet() {
  const navigate = useNavigate()
  const [pk, setPk] = useState("");
   const { password } = useApp()

  const handle = () => {
    try {
      const w = importWallet(pk);
      // const pass = localStorage.getItem("WALLET_PASSWORD");

      const cipher = encrypt(w.privateKey, password);
      localStorage.setItem("WALLET_DATA", cipher);
      localStorage.setItem("WALLET_ADDRESS", w.address);

     navigate("/dashboard");
    } catch {
      alert("Invalid private key");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-xl shadow max-w-md w-full">
        <h1 className="text-xl mb-4 font-semibold">Import Wallet</h1>

        <input
          className="border p-3 w-full rounded mb-3"
          placeholder="Enter private key"
          onChange={(e) => setPk(e.target.value)}
        />

        <button
          onClick={handle}
          className="bg-blue-600 text-white py-2 rounded w-full"
        >
          Import Wallet
        </button>

        <div className="text-center mt-4">
          <Link to="/create-wallet" className="text-blue-600 underline">
            Create Wallet
          </Link>
        </div>
      </div>
    </div>
  );
}
