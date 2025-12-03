import { useState } from "react";
import { Link } from 'react-router-dom';
import { createWallet } from "../lib/wallet";
import { encrypt } from "../lib/crypto";
import { useApp } from "../context/AppContext";

export default function CreateWallet() {
  const [wallet, setWallet] = useState(null);
  const { password } = useApp()

  const generate = () => {
    const w = createWallet();
    setWallet(w);

    // const pass = localStorage.getItem("WALLET_PASSWORD");
    const cipher = encrypt(w.privateKey, password);

    localStorage.setItem("WALLET_DATA", cipher);
    localStorage.setItem("WALLET_ADDRESS", w.address);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-xl shadow max-w-md w-full">
        <h1 className="text-xl font-semibold mb-4">Create Wallet</h1>

        {!wallet && (
          <button
            onClick={generate}
            className="bg-blue-600 text-white py-2 w-full rounded-lg"
          >
            Create Wallet
          </button>
        )}

        {wallet && (
          <div className="bg-gray-100 p-3 mt-4 rounded">
            <div><b>Address:</b> {wallet.address}</div>
            <div className="break-all"><b>Private Key:</b> {wallet.privateKey}</div>
            <br/>
            <p className="text-sm text-red-500 mt-2">
              Private key encrypted & saved.
            </p>
          </div>
        )}

        {wallet? (<div className="text-center mt-4">
          <Link to="/dashboard" className="text-blue-600 underline">
            Go to Dashboard
          </Link>
        </div> ):(<div className="text-center mt-4">
          <Link to="/import-wallet" className="text-blue-600 underline">
            Import Wallet
          </Link>
        </div>)}
      </div>
    </div>
  );
}
