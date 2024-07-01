import { type FrameRequest, getFrameMessage } from "@coinbase/onchainkit/frame";
import { type NextRequest, NextResponse } from "next/server";
import { encodeFunctionData, parseEther } from "viem";
import { baseSepolia } from "viem/chains";
import { StockManagerABI } from "../../../../_contracts/StockManager";
import type { FrameTransactionResponse } from "@coinbase/onchainkit/frame";
import { getDropProductData } from "@/lib/dropHelpers";
import { ACTIVE_CHAIN_ID } from "@/lib/viemClient";

export async function POST(
  req: NextRequest,
  { dropId }: { dropId: string },
): Promise<NextResponse | Response> {
  const body: FrameRequest = await req.json();

  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey: process.env.NEYNAR_API_KEY,
  });

  if (!isValid) {
    return new NextResponse("Message not valid", { status: 500 });
  }

  if (!message.address) {
    return new NextResponse("No wallet address provided", { status: 500 });
  }

  const drop = await getDropProductData(parseInt(dropId));

  if (!drop) {
    return new NextResponse("No drop exist", { status: 500 });
  }
  const data = encodeFunctionData({
    abi: StockManagerABI,
    functionName: "mint",
    args: [message.address as `0x${string}`, BigInt(dropId), BigInt(1), "0x0"],
  });

  console.log("Data for TX", data);
  const txData: FrameTransactionResponse = {
    chainId: `eip155:${ACTIVE_CHAIN_ID}`,
    method: "eth_sendTransaction",
    params: {
      abi: StockManagerABI,
      data,
      to: drop.dropData.contractAddress as `0x${string}`,
      value: parseEther(drop.dropData.ethPrice).toString(), // 0.00004 ETH
    },
  };
  return NextResponse.json(txData);
}
