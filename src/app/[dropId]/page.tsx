import Link from "next/link";
import { getFrameMetadata } from "@coinbase/onchainkit/frame";
import type { Metadata } from "next";
import { getDropProductData } from "@/lib/dropHelpers";
import { type ButtonState, getButtonsWithState } from "@/lib/frame";
import { env } from "@/env";

type Props = {
  params: { dropId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export type FrameState = {
  selections: { name: string; value: string }[];
  buttonsState: ButtonState[];
};

export async function generateMetadata({ params }: Props): Promise<any> {
  // read route params
  const dropId = params.dropId;

  const data = await getDropProductData(parseInt(dropId));
  const product = data?.productData;
  const option = product?.options?.[0];
  console.log(data?.productData?.featuredImage);
  if (!option) {
    const frameMetadata = getFrameMetadata({
      buttons: [
        {
          action: "tx",
          label: "Buy Now!",
          target: `${env.NEXT_PUBLIC_URL}/api/drops/${dropId}/tx`,
          postUrl: `${env.NEXT_PUBLIC_URL}/api/drops/${dropId}/tx-success`,
        },
      ],
      image: {
        src: product?.featuredImage?.url,
        aspectRatio: "1:1",
      },
      postUrl: `${env.NEXT_PUBLIC_URL}/api/frame`,
    });

    const metadata: Metadata = {
      title: "Onchain Checkout Frame",
      description: "LFG",
      openGraph: {
        title: "Onchain Checkout Frame",
        description:
          "Farcaster Frame to purchase a product onchain and checkout with Shopify.",
        images: [product?.featuredImage?.url],
      },
      other: {
        ...frameMetadata,
      },
    };

    return metadata;
  }

  const { buttons, buttonsState } = getButtonsWithState(option, 0);
  const frameMetadata = getFrameMetadata({
    // @ts-ignore
    buttons,
    image: {
      src: product?.featuredImage?.url,
      aspectRatio: "1:1",
    },
    postUrl: `${env.NEXT_PUBLIC_URL}/api/drops/${dropId}/frame`,
    state: {
      selections: [],
      buttonsState,
    },
  });

  const metadata: Metadata = {
    title: "Onchain Checkout Frame",
    description: "LFG",
    openGraph: {
      title: "Onchain Checkout Frame",
      description:
        "Farcaster Frame to purchase a product onchain and checkout with Shopify.",
      images: [product?.featuredImage?.url],
    },
    other: {
      ...frameMetadata,
    },
  };

  return metadata;
}

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Onchain Checkout Frame
        </h1>
        {/* github link */}
        <Link
          className="font-mono text-xl font-bold text-gray-400 hover:underline"
          href="https://github.com/META-DREAMER/onchain-checkout-frame"
          target={"_blank"}
        >
          Github
        </Link>
      </div>
    </main>
  );
}
