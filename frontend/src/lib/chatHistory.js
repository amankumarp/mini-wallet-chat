import { decryptWithPrivateKey,  deriveSecretKey } from "./e2e";

export async function loadChatFromServer(myAddress, otherAddress) {
  if (!myAddress || !otherAddress) return [];

  const url = `${import.meta.env.VITE_BACKEND_URL}/chat/history?user1=${myAddress}&user2=${otherAddress}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data) return [];

    return data.map(m => ({
      ...m,
      outgoing: m.fromAddress.toLowerCase() === myAddress.toLowerCase()
    }));
  } catch (err) {
    console.error("Chat load error:", err);
    return [];
  }
}


export async function decryptChatHistory(thierPublicKey, MyPrivateKey,myAddress, history) {
  const result = [];

  for (let m of history) {
    const sharedSecret = await deriveSecretKey(MyPrivateKey, "04" + thierPublicKey);
    const decrypted = await decryptWithPrivateKey(
      sharedSecret.toString("hex"),
      m.messageText
    );

    result.push({
      ...m,
      messageText: decrypted,
      outgoing: m.fromAddress.toLowerCase() === myAddress.toLowerCase()
    });
  }

  return result;
}

