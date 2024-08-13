import {
  type FrameRequest,
  getFrameMessage,
  getFrameHtmlResponse,
} from "@coinbase/onchainkit/frame";
import { type NextRequest, NextResponse } from "next/server";
import { getCheckoutUrl } from "@/lib/checkouts/getCheckoutUrl";
import { getDropProductData } from "@/lib/dropHelpers";
import type { FrameState } from "@/app/[dropId]/page";
import { getFarcasterAccountAddress, getImageForFrame } from "@/lib/frame";

export async function POST(
  req: NextRequest,
  { params }: { params: { dropId: string } },
): Promise<NextResponse> {
  const body: FrameRequest = await req.json();

  console.log("body + options", body);

  const { isValid, message } = await getFrameMessage(body);
  console.log("message success", message);

  if (!isValid) {
    return new NextResponse("Message not valid", { status: 500 });
  }

  let state = {
    buttonsState: [],
    selections: [],
  } as FrameState;

  try {
    state = JSON.parse(
      decodeURIComponent(message.state?.serialized),
    ) as FrameState;
  } catch (e) {
    console.error("Error parsing state", e);
  }
  console.log("state success", state);
  const drop = await getDropProductData(
    parseInt(params.dropId),
    state.selections,
  );

  if (!drop) {
    return new NextResponse("No drop exist", { status: 404 });
  }

  // create checkout
  const txHash = message.transaction?.hash as `0x${string}`;
  if (!txHash) {
    return new NextResponse("No tx hash given", { status: 500 });
  }

  const fid = message.interactor.fid;
  const verifiedAddress = getFarcasterAccountAddress(message.interactor);
  const checkout = await getCheckoutUrl({
    expectedUserAddress: verifiedAddress,
    dropId: parseInt(params.dropId),
    mintTxHash: txHash,
    farcasterFid: fid,
    selectedOptions: state.selections,
  });
  console.log("checkout success", checkout);
  if (!checkout) {
    return new NextResponse("No checkout available", { status: 500 });
  }
  const frameImg = getImageForFrame(
    params.dropId,
    drop.productData?.variantBySelectedOptions?.image?.url ||
      drop.productData?.featuredImage?.url,
    "Minting Succeeded!",
  );
  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: `Complete Checkout`,
          action: "link",
          target: checkout?.webUrl,
        },
      ],
      image: frameImg,
    }),
  );
}
