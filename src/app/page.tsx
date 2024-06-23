import Link from "next/link";
import { NEXT_PUBLIC_URL } from "./config";
import { getFrameMetadata } from "@coinbase/onchainkit/frame";
import type { Metadata } from "next";

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      action: "tx",
      label: "Buy Now!",
      target: `${NEXT_PUBLIC_URL}/api/tx`,
      postUrl: `${NEXT_PUBLIC_URL}/api/tx-success`,
    },
  ],
  image: {
    src: `${NEXT_PUBLIC_URL}/park-3.png`,
    aspectRatio: "1:1",
  },
  postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
});

export const metadata: Metadata = {
  title: "Onchain Checkout Frame",
  description: "LFG",
  openGraph: {
    title: "Onchain Checkout Frame",
    description:
      "Farcaster Frame to purchase a product onchain and checkout with Shopify.",
    images: [`${NEXT_PUBLIC_URL}/park-1.png`],
  },
  other: {
    ...frameMetadata,
  },
};

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
