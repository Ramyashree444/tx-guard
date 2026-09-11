import { NextResponse } from "next/server";

const RPC_URL = "http://127.0.0.1:8546";

const BAYC = "0xBC4CA0EdA7647A8aB7c2061c2E118A18a936f13D";

const OWNER = "0x46EFbAedc92067Ed660E84ED6395099723252496";

const OPERATOR = "0x1111111111111111111111111111111111111111";

async function rpc(method: string, params: unknown[]) {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC HTTP error: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.result;
}

export async function GET() {
  try {
    const blockNumber = await rpc("eth_blockNumber", []);

    const ownerPadded = OWNER.slice(2).padStart(64, "0");
    const operatorPadded = OPERATOR.slice(2).padStart(64, "0");

    const calldata =
      "0xe985e9c5" +
      ownerPadded +
      operatorPadded;

    const result = await rpc("eth_call", [
      {
        to: BAYC,
        data: calldata,
      },
      "latest",
    ]);

    const approved = BigInt(result) !== BigInt(0);

    return NextResponse.json({
      success: true,
      chainId: 1,
      blockNumber: parseInt(blockNumber, 16),
      contract: BAYC,
      owner: OWNER,
      operator: OPERATOR,
      approved,
      message: approved
        ? "Operator is approved to manage all NFTs."
        : "Operator is NOT approved.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not read local fork state",
      },
      { status: 500 }
    );
  }
}