export default function TxModal({ tx, onClose }) {
  if (!tx) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h2 className="text-xl font-semibold mb-3">Transaction Details</h2>

        <div className="space-y-2 text-sm">
          <div><b>Status:</b> 
            <span className={tx.status === "success" ? "text-green-600" : "text-red-600"}>
              {" "}{tx.status}
            </span>
          </div>

          <div><b>From:</b> {tx.from}</div>
          <div><b>To:</b> {tx.to}</div>
          <div><b>Amount:</b> {tx.amount} ETH</div>
          <div><b>Tx Fee:</b> {tx.txFee} ETH</div>

          <div>
            <b>Tx Hash:</b>
            <a
              href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
              target="_blank"
              className="text-blue-600 underline ml-1"
            >
              {tx.hash.slice(0, 12)}...
            </a>
          </div>
        </div>

        <button
          className="bg-blue-600 text-white w-full py-2 mt-4 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
