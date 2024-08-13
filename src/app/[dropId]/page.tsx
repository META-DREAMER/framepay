import Image from "next/image";
import { getFrameMetadata } from "@coinbase/onchainkit/frame";
import type { Metadata } from "next";
import { Button } from '@/components/ui/button';

import { getDropProductData } from "@/lib/dropHelpers";
import {
  type ButtonState,
  getButtonsWithState,
  getImageForFrame,
} from "@/lib/frame";
import { env } from "@/env";
import { notFound } from "next/navigation";
import { FarcasterIcon } from "@/components/icons/FarcasterIcon";
import Link from "next/link";
import WarpcastQR from '../../../public/warpcast-qr.png';

type Props = {
  params: { dropId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export type FrameState = {
  selections: { name: string; value: string }[];
  buttonsState: ButtonState[];
};

export const revalidate = 0;

export default async function HomePage({ params }: Props) {
  const dropId = params.dropId;

  const data = await getDropProductData(parseInt(dropId));

  if (!data || !data.productData) {
    notFound()
  }
  const { title, descriptionHtml, images } = data.productData;

  const price = data.dropData.ethPrice;

  return (
    <main className="min-h-screen bg-flatGray">
      <div className="container mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <div className="space-y-6 flex flex-col">
            {images.nodes.length > 0 && (
              <div className="h-96">
                <Image
                  src={images.nodes[0]?.url}
                  width={images.nodes[0]?.width || undefined}
                  height={images.nodes[0]?.height || undefined}
                  alt={title}
                  className="rounded-lg h-full w-full object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold text-baseBlue">{title}</h1>
              <p className="text-2xl font-medium text-baseBlue/70">{price} ETH</p>

            </div>

            <div className="text-xl text-gray-700 leading-7" dangerouslySetInnerHTML={{ __html: descriptionHtml }}></div>
            <div className="space-y-4">
            <Link
                target={"_blank"}
                href={`https://warpcast.com/~/compose?text=${encodeURIComponent("The /onchainsummer Collection 🔵🏝️🌞")}&embeds[]=https%3A%2F%2Fframe.mf.app%2F1`}>
                <Button className="w-full bg-warpcastPurple hover:bg-warpcastPurple/90 text-lg  py-3">
                  <FarcasterIcon className="mr-2 h-4 w-4"/>
                  Share on WarpCast
                </Button>
              </Link>
              <Image
                src={WarpcastQR}
                alt={"Warpcast QR Code"}
                layout="fit"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {images.nodes ? images.nodes.slice(1).map((img, index) => (
              <div key={index} className="relative">
                <Image
                  src={img.url}
                  alt={`${title} - ${index + 1}`}
                  width={img.width || undefined}
                  height={img.height || undefined}
                  className="rounded-lg object-fit"
                />
              </div>
            )) : null}
          </div>
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: Props): Promise<any> {
  // read route params
  const dropId = params.dropId;

  const data = await getDropProductData(parseInt(dropId));
  const product = data?.productData;
  const option = product?.options?.[0];
  if (!option) {
    const frameImage = getImageForFrame(dropId, product?.featuredImage?.url);
    const frameMetadata = getFrameMetadata({
      buttons: [
        {
          action: "tx",
          label: "Buy Now!",
          target: `${env.NEXT_PUBLIC_URL}/api/drops/${dropId}/tx`,
          postUrl: `${env.NEXT_PUBLIC_URL}/api/drops/${dropId}/tx-success`,
        },
      ],
      image: frameImage,
    });

    return {
      title: product?.title || "FramePay",
      description: product?.description,
      openGraph: {
        title: product?.title || "FramePay",
        description: product?.description || "Farcaster Frame to purchase a product onchain and checkout with Shopify.",
        images: [product?.featuredImage?.url],
      },
      other: {
        ...frameMetadata,
      },
    } satisfies Metadata;
  }

  const { buttons, buttonsState, imageText } = getButtonsWithState(option, 0);
  const frameImage = getImageForFrame(dropId, product?.featuredImage?.url, imageText);
  const frameMetadata = getFrameMetadata({
    // @ts-ignore
    buttons,
    image: frameImage,
    postUrl: `${env.NEXT_PUBLIC_URL}/api/drops/${dropId}/frame`,
    state: {
      selections: [],
      buttonsState,
    },
  });

  return {
    title: product?.title || "FramePay",
    description: product?.description,
    openGraph: {
      title: product?.title || "FramePay",
      description: product?.description || "Farcaster Frame to purchase a product onchain and checkout with Shopify.",
      images: [frameImage.src],
    },
    other: {
      ...frameMetadata,
    },
  } satisfies Metadata;
}
