import { type FrameRequest, getFrameMessage } from "@coinbase/onchainkit/frame";
import { type NextRequest, NextResponse } from "next/server";
import { encodeFunctionData, parseEther } from "viem";
import { FrameMintTxABI, StockManagerABI } from "@/app/_contracts/StockManager";
import type { FrameTransactionResponse } from "@coinbase/onchainkit/frame";
import { getDropProductData } from "@/lib/dropHelpers";
import { ACTIVE_CHAIN_ID } from "@/lib/viemClient";
import { getFarcasterAccountAddress } from "@/lib/frame";

export async function POST(
  req: NextRequest,
  { params }: { params: { dropId: string } },
): Promise<NextResponse | Response> {
  const body: FrameRequest = await req.json();

  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey: process.env.NEYNAR_API_KEY,
  });
  console.log("params for tx", params);
  console.log("message for tx", message);

  if (!isValid) {
    return new NextResponse("Message not valid", { status: 500 });
  }

  const mintToAddress = getFarcasterAccountAddress(message.interactor);

  if (!mintToAddress) {
    return new NextResponse("No wallet address provided", { status: 500 });
  }
  const drop = await getDropProductData(parseInt(params.dropId));
  console.log("Drop for tx", drop);
  if (!drop) {
    return new NextResponse("No drop exist", { status: 500 });
  }
  const data = encodeFunctionData({
    abi: FrameMintTxABI,
    functionName: "mint",
    args: [
      mintToAddress as `0x${string}`,
      BigInt(params.dropId),
      BigInt(1),
      "0x0",
    ],
  });

  console.log("Data for TX", data);
  const txData: FrameTransactionResponse = {
    chainId: `eip155:${ACTIVE_CHAIN_ID}`,
    method: "eth_sendTransaction",
    params: {
      abi: FrameMintTxABI,
      data,
      to: drop.dropData.contractAddress as `0x${string}`,
      value: parseEther(drop.dropData.ethPrice).toString(), // 0.00004 ETH
    },
  };
  return NextResponse.json(txData);
}
