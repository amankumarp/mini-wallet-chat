// src/lib/ethcrypto.js
import EthCrypto from "eth-crypto";
import eccrypto from "eccrypto";  
import { ethers } from "ethers";

export function publicKeyFromPrivate(privateKey) {
  // privateKey should be "0x...."
  const pk = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
  return EthCrypto.publicKeyByPrivateKey(pk); // returns unprefixed hex "04..."
}

// Derive shared secret key from your privateKey and recipient's publicKey
export async function deriveSecretKey(privateKey, recipientPublicKey) {
  // privateKey: "0x...."
  const pk = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
  // recipientPublicKey: "04...." or "0x04...."
  const pub = recipientPublicKey.startsWith("0x")
    ? recipientPublicKey.slice(2)
    : recipientPublicKey;

  const privateKeyBuffer = Buffer.from(pk, "hex");
  const publicKeyBuffer = Buffer.from(pub, "hex");

  const sharedSecret = await eccrypto.derive(privateKeyBuffer, publicKeyBuffer);
  return sharedSecret; // Buffer
}

// Sign a message (server will verify) - proof of ownership
export async function signProofOfKey(privateKey, publicKey) {
  // simple payload: wallet address + pubkey
  const wallet = new ethers.Wallet(privateKey);
  const message = `SIGN_CHAT_KEY|${wallet.address.toLowerCase()}|${publicKey}`;
  const msgHash = EthCrypto.hash.keccak256(message);
  const signature = EthCrypto.sign(privateKey.slice(2), msgHash);
  return { message, msgHash, signature, address: wallet.address };
}

// Encrypt JSON/string message for recipientPublicKey
export async function encryptForPublicKey(recipientPublicKey, plaintextObj) {
  const text = typeof plaintextObj === "string"
    ? plaintextObj
    : JSON.stringify(plaintextObj);
  // recipientPublicKey should be hex string starting with "04..." (unprefixed) or "0x04..."
  const pub = recipientPublicKey.startsWith("0x")
    ? recipientPublicKey.slice(2)
    : recipientPublicKey;
  const encrypted = await EthCrypto.encryptWithPublicKey(pub, text); // returns object
  const encryptedString = EthCrypto.cipher.stringify(encrypted);
  // can be used to convert to string
  return encryptedString
}

// Decrypt with your privateKey
export async function decryptWithPrivateKey(privateKey, encrypted) {
  const encryptedObject = EthCrypto.cipher.parse(encrypted);
  // privateKey should be "0x..." (EthCrypto expects hex without 0x)
  const pk = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
  // encryptedObject should be the object returned by encryptWithPublicKey
  const decrypted = await EthCrypto.decryptWithPrivateKey(pk, encryptedObject);
  // decryptWithPrivateKey returns plaintext string
  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
}
