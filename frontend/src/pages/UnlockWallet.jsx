import { useState } from "react";
import { decrypt } from "../lib/crypto";
import { md5 } from "../lib/md5";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch } from "../context/AppContext";

export default function UnlockWallet() {
    const dispatch = useAppDispatch();
  const navigate = useNavigate(); 
  const [password, setPassword] = useState("");

  const unlock = () => {
    const stored = localStorage.getItem("WALLET_PASSWORD");
    if (md5(password) !== stored) return alert("Wrong password!");
    dispatch({type: "SET_PASSWORD", payload: password})
    
    const cipher = localStorage.getItem("WALLET_DATA");
    if (!cipher) return navigate("/create-wallet");

    const PK = decrypt(cipher, password);
    if (!PK) return alert("Failed to decrypt wallet");

    navigate("/dashboard");
  };

  useEffect(() => {
    const stored = localStorage.getItem("WALLET_PASSWORD");
    if (!stored) {
      navigate("/set-password");
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow">
        <h1 className="text-xl font-semibold mb-4">Unlock Wallet</h1>

        <input
          type="password"
          className="border p-3 w-full rounded mb-4"
          placeholder="Enter wallet password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={unlock}
          className="bg-blue-600 text-white w-full py-2 rounded-lg"
        >
          Unlock
        </button>
      </div>
    </div>
  );
}
