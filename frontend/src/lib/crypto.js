import CryptoJS from "crypto-js";

export function encrypt(text, password) {
  return CryptoJS.AES.encrypt(text, password).toString();
}

export function decrypt(cipher, password) {
  if (!cipher || cipher === "null" || cipher === "") {
    return null; // prevent crash
  }

  try {
    const bytes = CryptoJS.AES.decrypt(cipher, password);

    if (!bytes || !bytes.sigBytes || bytes.sigBytes <= 0) {
      return null;  // invalid password OR corrupt cipher
    }

    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch (err) {
    return null; // always fail safely
  }
}
