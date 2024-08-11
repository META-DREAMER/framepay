import type {
  FrameButtonMetadata,
  FrameValidationData,
} from "@coinbase/onchainkit/frame";
import { type ProductOption } from "@shopify/hydrogen-react/storefront-api-types";
import { env } from "@/env";

export type ButtonState = {
  selection?: {
    name?: string;
    value?: string;
  };
  paging?: {
    page?: number;
    currentName?: string;
  };
};

export type ButtonsWithState = {
  buttons: FrameButtonMetadata[];
  buttonsState: ButtonState[];
  imageText?: string;
};

export const getFarcasterAccountAddress = (
  interactor: FrameValidationData["interactor"],
) => {
  // Get the first verified account or custody account if first verified account doesn't exist
  return interactor.verified_accounts[0] ?? interactor.custody_address;
};

export const getFarcasterAuthorAddress = (author: FrameValidationData["raw"]["action"]["cast"]["author"]) => {
  // @ts-ignore verified_addresses is not in the types but is in the data
  const verifiedAddress = author.verified_addresses?.eth_addresses[0] || author.verifications[0];

  return verifiedAddress as `0x${string}` | undefined;
}

export const getImageForFrame = (
  dropId: string,
  productImageUrl: string,
  bottomText?: string,
) => {
  const imageUrl = new URL(`${env.NEXT_PUBLIC_URL}/api/drops/${dropId}/img`);
  imageUrl.searchParams.set("imageUrl", productImageUrl);
  if (bottomText) imageUrl.searchParams.set("bottomText", bottomText);
  return {
    src: imageUrl.toString(),
    aspectRatio: "1:1" as const,
  };
};

export function getButtonsWithState(
  option: Pick<ProductOption, "values" | "name">,
  page: number,
): ButtonsWithState {
  // slice options into 2 arrays, first one length of 4
  const firstOptions = option.values.slice(0, 4);
  const secondOptions = option.values.slice(4);

  if (!secondOptions.length && page === 0) {
    const buttons = firstOptions.map((value) => {
      return {
        action: "post",
        label: `${value}`,
      } as FrameButtonMetadata;
    });

    const buttonsState = firstOptions.map((value) => {
      return {
        selection: {
          name: option.name,
          value,
        },
      };
    });
    return {
      buttons,
      buttonsState,
      imageText: `Select ${option.name}`,
    };
  }

  return {
    buttons: [
      ...firstOptions.slice(0, 3).map((value) => {
        return {
          action: "post",
          label: `${value}`,
        } as FrameButtonMetadata;
      }),
      {
        action: "post",
        label: `Next`,
      },
    ],
    buttonsState: [
      ...firstOptions.slice(0, 3).map((value) => {
        return {
          selection: {
            name: option.name,
            value,
          },
        };
      }),
      {
        paging: {
          page: secondOptions.length ? page + 1 : 0,
          currentName: option.name,
        },
      },
    ],
  };
}
