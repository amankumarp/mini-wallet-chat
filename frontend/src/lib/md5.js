import CryptoJS from "crypto-js";

function md5(text) {
  return CryptoJS.MD5(text).toString();
}
export { md5 };