import Link from "next/link";
import { getFrameMetadata } from "@coinbase/onchainkit/frame";
import type { Metadata } from "next";
import Image from 'next/image'

import { env } from "@/env";

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      action: "tx",
      label: "Buy Now!",
      target: `${env.NEXT_PUBLIC_URL}/api/tx`,
      postUrl: `${env.NEXT_PUBLIC_URL}/api/tx-success`,
    },
  ],
  image: {
    src: `${env.NEXT_PUBLIC_URL}/park-3.png`,
    aspectRatio: "1:1",
  },
  postUrl: `${env.NEXT_PUBLIC_URL}/api/frame`,
});

export const metadata: Metadata = {
  title: "FramePay",
  description: "Farcaster Frame to purchase a product onchain and checkout with Shopify.",
  openGraph: {
    title: "FramePay",
    description:
      "Farcaster Frame to purchase a product onchain and checkout with Shopify.",
    images: [`${env.NEXT_PUBLIC_URL}/FramePay.png`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-flatGray">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <Image
          src="/FramePay.png"
          width={250}
          height={250}
          alt="FramePay Logo"
        />
        <Link
          className="font-mono text-xl font-bold text-gray-800 hover:underline"
          href="https://github.com/META-DREAMER/framepay"
          target={"_blank"}
        >
          Github
        </Link>
      </div>
    </main>
  );
}
