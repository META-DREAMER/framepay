import "server-only";
import { db } from "@/server/db";
import { getDropOrderForTxHash } from "@/lib/shopAdminApi";
import {
  createCheckout,
  getCheckout,
  getShopifyProductData,
} from "@/lib/shopApi";
import { publicViemClient } from "@/lib/viemClient";
import { type ContractFunctionArgs, decodeFunctionData } from "viem";
import { CheckoutsTable } from "@/server/db/schema";
import type {
  CheckoutLineItemInput,
  SelectedOptionInput,
} from "@shopify/hydrogen-react/storefront-api-types";
import { StockManagerABI } from "@/app/_contracts/StockManager";
import { type Checkout } from "../storefront-generated/storefront.types";

type MintArgs = ContractFunctionArgs<typeof StockManagerABI, "payable", "mint">;

type GetCheckoutUrlArgs = {
  expectedUserAddress: string;
  dropId: number;
  mintTxHash: `0x${string}`;
  farcasterFid: number;
  selectedOptions: SelectedOptionInput[];
};

export const getCheckoutUrl = async ({
  expectedUserAddress,
  dropId,
  mintTxHash,
  farcasterFid,
  selectedOptions,
}: GetCheckoutUrlArgs): Promise<Pick<Checkout, "id" | "webUrl"> | null> => {
  // TODO: Authenticate payload to farcaster frame to ensure user matches the address that made the mint TX
  const dropData = await db.query.DropsTable.findFirst({
    where: (drops, { eq }) => eq(drops.id, dropId),
    with: {
      products: true,
    },
  });
  if (!dropData) {
    throw new Error("Drop not found");
  }
  const transactionReceipt = await publicViemClient.waitForTransactionReceipt({
    hash: mintTxHash,
  });

  if (!transactionReceipt) {
    throw new Error("Transaction not found");
  }
  if (transactionReceipt.status !== "success") {
    throw new Error("Transaction did not succeed.");
  }
  const transaction = await publicViemClient.getTransaction({
    hash: mintTxHash,
  });

  const contractAddress = transaction.to;

  const { args, functionName } = decodeFunctionData({
    abi: StockManagerABI,
    data: transaction.input,
  });
  const [to, tokenId] = args as MintArgs;
  console.log({ to, tokenId, expectedUserAddress, contractAddress });
  if (to.toLowerCase() !== expectedUserAddress.toLowerCase()) {
    throw new Error("User address does not match expected address");
  }
  if (
    !contractAddress ||
    dropData.contractAddress.toLowerCase() !== contractAddress.toLowerCase()
  ) {
    throw new Error("Transaction does not belong to this drop");
  }
  if (dropData.tokenId && dropData.tokenId !== Number(tokenId)) {
    throw new Error("Token ID does not match drop");
  }
  if (functionName !== "mint") {
    throw new Error("Not a mint transaction");
  }

  const existingOrder = await getDropOrderForTxHash(mintTxHash);

  const existingCheckout = await db.query.CheckoutsTable.findFirst({
    where: (checkouts, { ilike }) =>
      ilike(checkouts.transactionHash, mintTxHash),
  });
  console.log("existingOrder / checkout", existingOrder, existingCheckout);

  if (existingOrder && !existingCheckout) {
    return null;
  }

  if (existingCheckout) {
    // const checkoutStatus = await getCheckout(
    //   existingCheckout.shopifyCheckoutId,
    // );
    return {
      id: existingCheckout.shopifyCheckoutId,
      webUrl: existingCheckout.url,
      // completedOrder: existingOrder,
      // checkoutStatus,
    };
  }

  const productData = await Promise.all([
    getShopifyProductData(dropData.shopifyProductId, selectedOptions),
    ...dropData.products.map((product) => {
      return getShopifyProductData(
        product.bundledShopifyProductId,
        selectedOptions,
      );
    }),
  ]);

  const createCheckoutRes = await createCheckout({
    customAttributes: [
      { key: "Ethereum Address", value: expectedUserAddress },
      { key: "mintTxHash", value: mintTxHash },
      { key: "farcasterFid", value: farcasterFid.toString() },
    ],
    lineItems: productData.reduce<CheckoutLineItemInput[]>((acc, product) => {
      if (!product?.variantBySelectedOptions) {
        throw new Error(
          `No variant found for bundled product (id: ${product?.id})! Product options must match between bundled products and main product for a drop.`,
        );
        // return [...acc];
      }
      return [
        ...acc,
        {
          variantId: product.variantBySelectedOptions.id,
          quantity: 1,
        },
      ];
    }, []),
  });

  if (!createCheckoutRes?.checkout) {
    console.log("checkoutUserErrors", createCheckoutRes?.checkoutUserErrors);
    throw new Error("Error creating checkout");
  }
  const { checkout } = createCheckoutRes;
  // insert into db
  await db.insert(CheckoutsTable).values({
    transactionHash: mintTxHash,
    url: checkout.webUrl,
    shopifyCheckoutId: checkout.id,
    dropId,
    walletAddress: expectedUserAddress,
    farcasterFid,
  });

  return checkout;
};
