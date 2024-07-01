import {
  type FrameRequest,
  getFrameMessage,
  getFrameHtmlResponse,
} from "@coinbase/onchainkit/frame";
import { type NextRequest, NextResponse } from "next/server";
import { getCheckoutUrl } from "@/lib/checkouts/getCheckoutUrl";
import { getDropProductData } from "@/lib/dropHelpers";

export async function POST(
  req: NextRequest,
  { params }: { params: { dropId: string } },
): Promise<NextResponse> {
  const body: FrameRequest = await req.json();
  const searchParams = req.nextUrl.searchParams;

  const selectedOptions = [];
  for (const entry of searchParams.entries()) {
    const [key, value] = entry;
    selectedOptions.push({
      name: key,
      value: value,
    });
  }

  const { isValid, message } = await getFrameMessage(body);

  if (!message?.address) {
    return new NextResponse("No wallet address from frame message", {
      status: 500,
    });
  }

  if (!isValid) {
    return new NextResponse("Message not valid", { status: 500 });
  }

  const drop = await getDropProductData(parseInt(params.dropId));

  if (!drop) {
    return new NextResponse("No drop exist", { status: 500 });
  }

  if (!drop) {
    return new NextResponse("No drop available", { status: 500 });
  }
  // create checkout
  const txHash = body?.untrustedData?.transactionId as `0x${string}`;
  if (!txHash) {
    return new NextResponse("No drop available", { status: 500 });
  }

  const fid = message.interactor.fid;

  const checkout = await getCheckoutUrl({
    expectedUserAddress: message.address,
    dropId: parseInt(params.dropId),
    mintTxHash: txHash,
    farcasterFid: fid,
    selectedOptions,
  });

  if (!checkout) {
    return new NextResponse("No checkout available", { status: 500 });
  }

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: `Checkout!`,
          action: "post_redirect",
          target: checkout?.webUrl,
        },
      ],
      image: {
        src: drop.productData?.featuredImage?.url,
      },
    }),
  );
}
