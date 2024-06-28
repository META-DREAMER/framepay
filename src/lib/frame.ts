import { FrameButtonMetadata } from "@coinbase/onchainkit/frame";
import { ProductOption } from "@shopify/hydrogen-react/storefront-api-types";

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
