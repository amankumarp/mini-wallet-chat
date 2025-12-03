import { ethers } from "ethers";

const RPC_URL = import.meta.env.VITE_RPC_URL;

export function getProvider() {
  return new ethers.JsonRpcProvider( RPC_URL||"https://rpc.sepolia.org");
}

export async function getNetwork() {
  const net = await getProvider().getNetwork();
  return net;
}

export async function getBalance(address) {
  const bal = await getProvider().getBalance(address);
  return ethers.formatEther(bal);
}

export function createWallet() {
  const w = ethers.Wallet.createRandom();
  return {
    address: w.address,
    privateKey: w.privateKey,
  };
}

export function importWallet(privateKey) {
  const w = new ethers.Wallet(privateKey);
  return {
    address: w.address,
    privateKey: w.privateKey,
  };
}

export async function sendEth(privateKey, to, amount) {
  const provider = getProvider();
  const signer = new ethers.Wallet(privateKey, provider);
  const tx = await signer.sendTransaction({
    to,
    value: ethers.parseEther(amount),
  });
  return await tx.wait();
}
