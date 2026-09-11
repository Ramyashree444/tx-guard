"use client";

import { useState } from "react";
import {
  BrowserProvider,
  JsonRpcProvider,
  formatEther,
  Interface,
} from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const ERC721_ABI = [
  "function setApprovalForAll(address operator, bool approved)",
];

function decodeTransaction(data: string) {
  if (!data || data === "0x") {
    return {
      functionName: "Native Transfer",
      description: "Simple native token transfer.",
      risk: "LOW",
    };
  }

  try {
    const iface = new Interface(ERC721_ABI);

    const decoded = iface.decodeFunctionData(
      "setApprovalForAll",
      data
    );

    const approved = decoded[1];

    if (approved === true) {
      return {
        functionName: "setApprovalForAll(address,bool)",
        description:
          "🚨 This contract is requesting permission to manage ALL of your NFTs.",
        risk: "CRITICAL",
      };
    }

    return {
      functionName: "setApprovalForAll(address,bool)",
      description: "NFT approval is being disabled.",
      risk: "LOW",
    };
  } catch {
    return {
      functionName: `Unknown Function (${data.slice(0, 10)})`,
      description:
        "⚠️ TX Guard cannot recognize this function.",
      risk: "MEDIUM",
    };
  }
}

export default function Home() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");

  const [analysis, setAnalysis] = useState<any>(null);
  const [stateDiff, setStateDiff] = useState({
  before: false,
  after: false,
});
  const [loading, setLoading] = useState(false);

  const [forkStatus, setForkStatus] = useState(false);
  const [forkBlock, setForkBlock] = useState("");
  const [forkChain, setForkChain] = useState("");
  const [forkLoading, setForkLoading] = useState(false);
  const [forkError, setForkError] = useState("");

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask.");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();

      const address = await signer.getAddress();

      const walletBalance = await provider.getBalance(address);

      setAccount(address);
      setBalance(formatEther(walletBalance));
    } catch (error) {
      console.error(error);
      alert("Wallet connection failed.");
    }
  }

  async function checkForkConnection() {
    setForkLoading(true);
    setForkError("");
    setForkStatus(false);

    try {
      const provider = new JsonRpcProvider(
        "http://127.0.0.1:8546"
      );

      const network = await provider.getNetwork();

      const blockNumber = await provider.getBlockNumber();

      setForkChain(network.chainId.toString());
      setForkBlock(blockNumber.toString());
      setForkStatus(true);
    } catch (error) {
      console.error(error);

      setForkError(
        "Cannot connect to Anvil. Make sure Anvil is running on port 8546."
      );
    }

    setForkLoading(false);
  }

  function scanTransaction() {
    setLoading(true);
    setStateDiff({
  before: false,
  after: false,
});

    const demoCalldata =
      "0xa22cb465" +
      "0000000000000000000000001234567890123456789012345678901234567890" +
      "0000000000000000000000000000000000000000000000000000000000000001";

    setTimeout(() => {
      const result = decodeTransaction(demoCalldata);
      setStateDiff({ before: false, after: true });

      setAnalysis(result);
      setLoading(false);
    }, 1000);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">

      <div className="max-w-3xl mx-auto">

        {/* HEADER */}

        <div className="text-center mb-8">

          <div className="text-5xl mb-3">
            🛡️
          </div>

          <h1 className="text-4xl font-bold">
            TX GUARD
          </h1>

          <p className="text-slate-400 mt-2">
            Crypto Transaction Shield
          </p>

        </div>


        {/* MAIN CARD */}

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">

          {!account ? (

            <div>

              <h2 className="text-2xl font-bold mb-2">
                Protect your wallet
              </h2>

              <p className="text-slate-400 mb-6">
                Analyze transactions before you sign them.
              </p>

              <button
                onClick={connectWallet}
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl py-4 font-bold"
              >
                🦊 Connect Wallet
              </button>

            </div>

          ) : (

            <div>

              {/* WALLET */}

              <div className="flex items-center gap-2 mb-5">

                <div className="w-3 h-3 bg-green-500 rounded-full" />

                <span className="font-bold text-lg">
                  Wallet Connected
                </span>

              </div>


              <div className="bg-slate-800 rounded-2xl p-5 mb-4">

                <p className="text-slate-400">
                  Wallet Address
                </p>

                <p className="font-mono mt-2 break-all">
                  {account}
                </p>

              </div>


              <div className="bg-slate-800 rounded-2xl p-5 mb-6">

                <p className="text-slate-400">
                  ETH Balance
                </p>

                <p className="text-2xl font-bold mt-2">
                  {Number(balance).toFixed(4)} ETH
                </p>

              </div>


              {/* LIVE FORK */}

              <div className="border-t border-slate-700 pt-6">

                <h2 className="text-2xl font-bold mb-2">
                  ⛓️ Live Blockchain Fork
                </h2>

                <p className="text-slate-400 mb-5">
                  Connect TX Guard to the local Ethereum Mainnet fork.
                </p>


                <button
                  onClick={checkForkConnection}
                  disabled={forkLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl py-4 font-bold"
                >
                  {forkLoading
                    ? "🔄 Connecting..."
                    : "🔗 Connect to Anvil Fork"}
                </button>


                {/* SUCCESS */}

                {forkStatus && (

                  <div className="mt-5 bg-green-950 border border-green-700 rounded-2xl p-5">

                    <div className="flex items-center gap-2 mb-4">

                      <div className="w-3 h-3 bg-green-500 rounded-full" />

                      <span className="font-bold text-green-400">
                        Fork Connected
                      </span>

                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div className="bg-slate-950 rounded-xl p-4">

                        <p className="text-slate-400 text-sm">
                          Chain ID
                        </p>

                        <p className="text-xl font-bold mt-1">
                          {forkChain}
                        </p>

                        <p className="text-slate-500 text-xs mt-1">
                          Ethereum Mainnet
                        </p>

                      </div>


                      <div className="bg-slate-950 rounded-xl p-4">

                        <p className="text-slate-400 text-sm">
                          Current Block
                        </p>

                        <p className="text-xl font-bold mt-1">
                          {forkBlock}
                        </p>

                        <p className="text-slate-500 text-xs mt-1">
                          Live fork state
                        </p>

                      </div>

                    </div>


                    <div className="mt-4 bg-slate-950 rounded-xl p-4">

                      <p className="text-slate-400 text-sm">
                        RPC Endpoint
                      </p>

                      <p className="font-mono text-sm mt-1 break-all">
                        http://127.0.0.1:8546
                      </p>

                    </div>

                  </div>

                )}


                {/* ERROR */}

                {forkError && (

                  <div className="mt-5 bg-red-950 border border-red-700 rounded-xl p-5">

                    <p className="font-bold text-red-400">
                      ❌ Fork Connection Failed
                    </p>

                    <p className="text-red-200 mt-2">
                      {forkError}
                    </p>

                  </div>

                )}

              </div>


              {/* TRANSACTION SCANNER */}

              <div className="border-t border-slate-700 pt-6 mt-6">

                <h2 className="text-2xl font-bold mb-2">
                  🔍 Transaction Scanner
                </h2>

                <p className="text-slate-400 mb-5">
                  Analyze a transaction before signing.
                </p>

                <button
                  onClick={scanTransaction}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl py-4 font-bold"
                >
                  {loading
                    ? "🔍 Analyzing..."
                    : "🔍 Scan Transaction"}
                </button>

              </div>


              {/* ANALYSIS */}

              {analysis && (
                


                <div className="mt-6 border border-slate-700 rounded-2xl p-6">

                  <h2 className="text-xl font-bold mb-5">
                    🧪 Transaction Analysis
                  </h2>

                  <p className="text-slate-400 text-sm">
                    Function Detected
                    <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
  <p className="text-slate-400 text-sm">TARGET CONTRACT</p>
  <p className="font-mono text-sm break-all mt-1">
    0xBC4CA0EdA7647A8aB7c2061c2E118A18a936f13D
  </p>

  <p className="text-slate-400 text-sm mt-4">OPERATOR</p>
  <p className="font-mono text-sm break-all mt-1">
    0x1111111111111111111111111111111111111111
  </p>

  <p className="text-yellow-400 text-sm mt-4">
    ⚠️ This operator is requesting global NFT management permission.
  </p>
</div>
                  </p>

                  <p className="font-mono text-lg mt-1 mb-5">
                    {analysis.functionName}
                  </p>


                  <p className="text-slate-400 text-sm">
                    Risk Level
                  </p>

                  <p className="text-3xl font-bold text-red-400 mt-1 mb-5">
                    {analysis.risk}
                  </p>


                  <div className="bg-slate-950 rounded-xl p-5">
                    {analysis.description}
                  </div>


                  {analysis.risk === "CRITICAL" && (

                    <div className="mt-5 bg-red-950 border border-red-700 rounded-xl p-5">

                      <p className="font-bold text-red-400 text-lg">
                        🚨 SECURITY WARNING
                      </p>

                      <p className="text-red-200 mt-2">
                        Do NOT sign this transaction.
                        <div className="mt-4 flex gap-3">
  <button
    onClick={() => alert("🛑 Transaction BLOCKED by TX Guard")}
    className="flex-1 rounded-xl bg-red-600 py-3 font-bold hover:bg-red-700"
  >
    🛑 BLOCK TRANSACTION
    <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
  <h3 className="font-bold text-lg mb-3">🔄 Blockchain State Diff</h3>

  <div className="grid grid-cols-2 gap-4">
    <div className="rounded-lg bg-slate-900 p-3">
      <p className="text-slate-400 text-sm">BEFORE</p>
      <p className="text-green-400 font-bold mt-2">
        NFT Approval: NOT APPROVED
      </p>
    </div>

    <div className="rounded-lg bg-slate-900 p-3">
      <p className="text-slate-400 text-sm">AFTER SIMULATION</p>
      <p className="text-red-400 font-bold mt-2">
        NFT Approval: APPROVED ⚠️
      </p>
    </div>
  </div>

  <p className="text-yellow-400 text-sm mt-4">
    ⚠️ Operator may manage all NFTs after this approval.
  </p>
</div>
  </button>

  <button
    onClick={() => alert("⚠️ User chose to continue anyway")}
    className="flex-1 rounded-xl bg-slate-700 py-3 font-bold hover:bg-slate-600"
  >
    Continue Anyway
  </button>
</div>
                      </p>

                    </div>

                  )}

                </div>

              )}

            </div>
              )}

        </div>


        <p className="text-center text-slate-600 mt-6">
          TX Guard protects your wallet before signing.
        </p>

      </div>

    </main>
  );
}