import { publicKeyFromPrivate, signProofOfKey } from "./e2e.js";

export async function registerChatKey(privateKey) {
  const publicKey = publicKeyFromPrivate(privateKey); // "04..."
  const proof = await signProofOfKey(privateKey, publicKey);
  // POST to backend
  await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat/register-key`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      address: proof.address,
      publicKey,
      message: proof.message,
      msgHash: proof.msgHash,
      signature: proof.signature
    })
  });
}

export function checkChatKey(address) {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/chat/pubkey?address=${address}`)
    .then(res => res.json())
    .then(data => data.publicKey);
}