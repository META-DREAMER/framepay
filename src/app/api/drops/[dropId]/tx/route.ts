import { type FrameRequest, getFrameMessage } from "@coinbase/onchainkit/frame";
import { type NextRequest, NextResponse } from "next/server";
import { encodeFunctionData, zeroAddress } from "viem";
import { FrameMintTxABI, StoreManagerABI } from "@/app/_contracts/StoreManager";
import type { FrameTransactionResponse } from "@coinbase/onchainkit/frame";
import { getDropProductData } from "@/lib/dropHelpers";
import { getFarcasterAccountAddress, getFarcasterAuthorAddress } from "@/lib/frame";
import { publicViemClient } from "@/lib/viemClient";

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
  const referrer = message.raw.action.cast?.author;
  console.log({ referrer });

  const referrerAddress = getFarcasterAuthorAddress(referrer);

  const drop = await getDropProductData(parseInt(params.dropId));
  console.log("Drop for tx", drop);
  if (!drop) {
    return new NextResponse("No drop exist", { status: 500 });
  }

  const contractAddress = drop.dropData.contractAddress as `0x${string}`;
  const tokenId = BigInt(drop.dropData.tokenId);

  const nftData = await publicViemClient.readContract({
    address: contractAddress,
    abi: StoreManagerABI,
    functionName: 'nftStore',
    args: [tokenId],
  });

  const price = nftData[5];

  const data = encodeFunctionData({
    abi: FrameMintTxABI,
    functionName: "mint",
    args: [
      mintToAddress as `0x${string}`,
      tokenId,
      BigInt(1),
      referrerAddress || zeroAddress,
      "0x0",
    ],
  });

  console.log("Data for TX", data);
  const txData: FrameTransactionResponse = {
    chainId: `eip155:${drop.dropData.chainId}`,
    method: "eth_sendTransaction",
    params: {
      abi: FrameMintTxABI,
      data,
      to: contractAddress,
      value: price.toString(), // 0.00004 ETH
    },
  };
  return NextResponse.json(txData);
}
