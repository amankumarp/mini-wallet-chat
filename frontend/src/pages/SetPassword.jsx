import { useState } from "react";
import { md5 } from "../lib/md5";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../context/AppContext";

export default function SetPassword() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const savePassword = () => {
    if (password !== confirm) return alert("Passwords do not match!");
    const md = md5(password)
    localStorage.setItem("WALLET_PASSWORD", md);
    dispatch({type: "SET_PASSWORD", payload: password})
    
    navigate("/create-wallet");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow">
        <h1 className="text-xl font-semibold mb-4">Set Wallet Password</h1>

        <input
          type="password"
          className="border p-3 w-full rounded mb-3"
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          className="border p-3 w-full rounded mb-4"
          placeholder="Confirm password"
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button
          onClick={savePassword}
          className="bg-blue-500 text-white w-full py-2 rounded-lg"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}
