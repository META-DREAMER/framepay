import { FrameState } from "@/app/[dropId]/page";
import { env } from "@/env";
import { getDropProductData } from "@/lib/dropHelpers";
import { getButtonsWithState } from "@/lib/frame";
import { getShopifyProductData } from "@/lib/shopApi";
import {
  getFrameMessage,
  getFrameHtmlResponse,
  FrameButtonMetadata,
} from "@coinbase/onchainkit/frame";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { dropId: string } },
): Promise<NextResponse> {
  const body = await req.json();

  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey: env.NEYNAR_API_KEY,
  });
  console.log("message", message);
  if (!isValid) {
    return new NextResponse("Message not valid", { status: 500 });
  }
  const dropId = params.dropId;
  const product = await getDropProductData(parseInt(dropId));
  if (!product) {
    return new NextResponse("No drop available", { status: 500 });
  }

  const buttonId = message.button;
  const option = product?.productData?.options?.[0];

  if (!option) {
    return new NextResponse("No options available", { status: 500 });
  }

  const { buttonsState } = getButtonsWithState(option, 0);

  let state = {
    buttonsState: buttonsState,
    selections: [],
  } as FrameState;

  try {
    state = JSON.parse(
      decodeURIComponent(message.state?.serialized),
    ) as FrameState;
  } catch (e) {
    console.error("Error parsing state", e);
  }

  const buttonState = state.buttonsState[buttonId - 1];

  const page = buttonState?.paging?.page;

  const { productData, dropData } = product;

  if (!productData) {
    return new NextResponse("No product data available", { status: 500 });
  }

  for (const option of productData.options) {
    const value = buttonState?.selection?.value;
    if (option.name === buttonState?.selection?.name && value) {
      state.selections.push({
        name: option.name,
        value,
      });
    }
  }

  const selectedOptions = [...state.selections];

  const productWithSelectedOptions = await getShopifyProductData(
    dropData.shopifyProductId,
    selectedOptions,
  );

  let renderedButtons;
  let image = productData?.featuredImage?.url;

  if (productWithSelectedOptions?.variantBySelectedOptions) {
    renderedButtons = [
      {
        action: "tx",
        label: "Buy Now!",
        target: `${env.NEXT_PUBLIC_URL}/api/drops/${dropId}/tx`,
        postUrl: `${env.NEXT_PUBLIC_URL}/api/drops/${dropId}/tx-success`,
      },
    ];
    image = {
      src:
        productWithSelectedOptions?.variantBySelectedOptions?.image?.url ||
        productData?.featuredImage?.url,
    };
  } else if (page) {
    // next page
    const currentOptionName = buttonState.paging?.currentName;
    if (!currentOptionName) {
      return new NextResponse("No current name selected", { status: 500 });
    }
    const availableValues = productData.options.find(
      (option) => option.name === currentOptionName,
    )?.values;
    if (!availableValues) {
      return new NextResponse("No available values", { status: 500 });
    }
    const optionsToSelect = availableValues.slice(page * 3);
    const { buttons, buttonsState } = getButtonsWithState(
      {
        name: currentOptionName,
        values: optionsToSelect,
      },
      page,
    );
    renderedButtons = buttons;
    image = {
      src: product?.productData?.featuredImage?.url,
      aspectRatio: "1:1",
    };
    state.buttonsState = buttonsState;
  } else {
    const remainingOptions = productData.options.filter(
      (option) =>
        !state.selections.some(
          (selectedOption) => selectedOption.name === option.name,
        ),
    );

    const theOption = remainingOptions[0];
    if (!theOption) {
      return new NextResponse("No more options", { status: 500 });
    }

    const { buttons, buttonsState } = getButtonsWithState(theOption, 0);
    renderedButtons = buttons;
    image = {
      src: product?.productData?.featuredImage?.url,
      aspectRatio: "1:1",
    };
    state.buttonsState = buttonsState;
  }
  console.log("final state", state.selections);
  return new NextResponse(
    getFrameHtmlResponse({
      buttons: renderedButtons as [
        FrameButtonMetadata,
        ...FrameButtonMetadata[],
      ],
      image,
      state,
      postUrl: `${env.NEXT_PUBLIC_URL}/api/drops/${dropId}/frame`,
    }),
  );
}
