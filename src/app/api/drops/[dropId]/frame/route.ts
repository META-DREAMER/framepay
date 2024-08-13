import { type NextRequest, NextResponse } from "next/server";
import { getFrameMessage, getFrameHtmlResponse, type FrameButtonMetadata } from "@coinbase/onchainkit/frame";
import { type FrameState } from "@/app/[dropId]/page";
import { env } from "@/env";
import { getDropProductData } from "@/lib/dropHelpers";
import { ButtonState, getButtonsWithState, getImageForFrame } from "@/lib/frame";
import { getShopifyProductData } from "@/lib/shopApi";

const ITEMS_PER_PAGE = 3;

interface ProductOption {
  name: string;
  values: string[];
}

interface ProductData {
  options: ProductOption[];
  featuredImage?: { url: string } | null;
}

interface DropProduct {
  productData: ProductData;
  dropData: {
    shopifyProductId: string;
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: { dropId: string } }
): Promise<NextResponse> {
  try {
    const { isValid, message } = await validateFrameMessage(req);
    if (!isValid) return errorResponse("Message not valid");

    const dropId = params.dropId;
    const product = await getDropProductData(parseInt(dropId));
    if (!product) return errorResponse("No drop available");

    const state = parseState(message.state?.serialized);
    const buttonId = message.button;

    if (buttonId === undefined || buttonId < 1 || buttonId > state.buttonsState.length) {
      return errorResponse("Invalid button ID");
    }

    const buttonState = state.buttonsState[buttonId - 1];

    const { productData, dropData } = product;
    if (!productData) return errorResponse("No product data available");

    updateSelections(state, buttonState, productData.options);

    const response = await handleUserSelection(state, buttonState, dropId, productData, dropData);
    return response;
  } catch (error) {
    console.error("Error processing frame:", error);
    return errorResponse("Internal server error");
  }
}

async function validateFrameMessage(req: NextRequest) {
  const body = await req.json();
  return getFrameMessage(body, { neynarApiKey: env.NEYNAR_API_KEY });
}

function parseState(serializedState: string | undefined): FrameState {
  try {
    return JSON.parse(decodeURIComponent(serializedState || "")) as FrameState;
  } catch (e) {
    console.error("Error parsing state", e);
    return { buttonsState: [], selections: [] };
  }
}

function updateSelections(state: FrameState, buttonState: ButtonState | undefined, options: ProductOption[]) {
  for (const option of options) {
    const value = buttonState?.selection?.value;
    if (option.name === buttonState?.selection?.name && value) {
      state.selections = state.selections.filter(selection => selection.name !== option.name);
      state.selections.push({
        name: option.name,
        value,
      });
    }
  }
}

async function handleUserSelection(
  state: FrameState,
  buttonState: ButtonState | undefined,
  dropId: string,
  productData: ProductData,
  dropData: { shopifyProductId: string }
) {
  const selectedOptions = [...state.selections];
  const productWithSelectedOptions = await getShopifyProductData(
    dropData.shopifyProductId,
    selectedOptions
  );

  if (productWithSelectedOptions?.variantBySelectedOptions) {
    return renderFinalFrame(dropId, productWithSelectedOptions, productData, selectedOptions);
  } else if (buttonState?.paging?.page !== undefined) {
    return renderNextPage(state, buttonState, dropId, productData);
  } else {
    return renderNextOption(state, dropId, productData);
  }
}

function renderFinalFrame(dropId: string, productWithSelectedOptions: any, productData: any, selectedOptions: any[]) {
  const buttons = [
    {
      action: "tx",
      label: "Buy Now!",
      target: `${env.NEXT_PUBLIC_URL}/api/drops/${dropId}/tx`,
      postUrl: `${env.NEXT_PUBLIC_URL}/api/drops/${dropId}/tx-success`,
    },
  ];

  const image = getImageForFrame(
    dropId,
    productWithSelectedOptions?.variantBySelectedOptions?.image?.url || productData.featuredImage?.url,
    `${selectedOptions.map((option) => `${option.name}: ${option.value}`).join(", ")}`
  );

  return new NextResponse(getFrameHtmlResponse({
    buttons: buttons as [FrameButtonMetadata, ...FrameButtonMetadata[]],
    image,
    state: { buttonsState: [], selections: selectedOptions },
    postUrl: `${env.NEXT_PUBLIC_URL}/api/drops/${dropId}/frame`,
  }));
}

function renderNextPage(state: FrameState, buttonState: any, dropId: string, productData: ProductData) {
  const currentOptionName = buttonState.paging?.currentName;
  if (!currentOptionName) return errorResponse("No current name selected");

  const availableValues = productData.options.find(
    (option) => option.name === currentOptionName
  )?.values;
  if (!availableValues) return errorResponse("No available values");

  const page = buttonState.paging?.page;
  if (page === undefined) return errorResponse("No page information");

  const optionsToSelect = availableValues.slice(page * ITEMS_PER_PAGE);
  const { buttons, buttonsState } = getButtonsWithState(
    { name: currentOptionName, values: optionsToSelect },
    page
  );

  const image = getImageForFrame(dropId, productData.featuredImage?.url || '', `Select ${currentOptionName}`);
  state.buttonsState = buttonsState;

  return new NextResponse(getFrameHtmlResponse({
    buttons: buttons as [FrameButtonMetadata, ...FrameButtonMetadata[]],
    image,
    state,
    postUrl: `${env.NEXT_PUBLIC_URL}/api/drops/${dropId}/frame`,
  }));
}

function renderNextOption(state: FrameState, dropId: string, productData: ProductData) {
  const remainingOptions = productData.options.filter(
    (option) => !state.selections.some((selectedOption) => selectedOption.name === option.name)
  );

  const nextOption = remainingOptions[0];
  if (!nextOption) return errorResponse("No more options");

  const { buttons, buttonsState } = getButtonsWithState(nextOption, 0);
  const image = getImageForFrame(dropId, productData.featuredImage?.url || '', `Select ${nextOption.name}`);
  state.buttonsState = buttonsState;

  return new NextResponse(getFrameHtmlResponse({
    buttons: buttons as [FrameButtonMetadata, ...FrameButtonMetadata[]],
    image,
    state,
    postUrl: `${env.NEXT_PUBLIC_URL}/api/drops/${dropId}/frame`,
  }));
}

function errorResponse(message: string) {
  return new NextResponse(message, { status: 500 });
}
