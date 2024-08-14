import "server-only";
import { db } from "@/server/db";
import { getDropOrderForTxHash } from "@/lib/shopAdminApi";
import { createCheckout, getShopifyProductData } from "@/lib/shopApi";
import { publicViemClient } from "@/lib/viemClient";
import { type ContractFunctionArgs, decodeFunctionData } from "viem";
import { CheckoutsTable } from "@/server/db/schema";
import type { SelectedOptionInput } from "@shopify/hydrogen-react/storefront-api-types";
import { StoreManagerABI } from "@/app/_contracts/StoreManager";
import { type Checkout } from "../storefront-generated/storefront.types";

type MintArgs = ContractFunctionArgs<typeof StoreManagerABI, "payable", "mint">;

type GetCheckoutUrlArgs = {
  expectedUserAddress: string;
  dropId: number;
  mintTxHash: `0x${string}`;
  farcasterFid: number;
  selectedOptions: SelectedOptionInput[];
};

type GetCheckoutUrlResponse = Pick<Checkout, "id" | "webUrl"> & { completedOrder?: any };

export const getCheckoutUrl = async ({
  expectedUserAddress,
  dropId,
  mintTxHash,
  farcasterFid,
  selectedOptions,
}: GetCheckoutUrlArgs): Promise<GetCheckoutUrlResponse | null> => {
  const dropData = await db.query.DropsTable.findFirst({
    where: (drops, { eq }) => eq(drops.id, dropId),
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
    abi: StoreManagerABI,
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
      completedOrder: !!existingOrder,
      // checkoutStatus,
    };
  }

  const productData = await getShopifyProductData(
    dropData.shopifyProductId,
    selectedOptions,
  );

  if (!productData?.variantBySelectedOptions) {
    throw new Error(
      `No variant found for selected options (id: ${productData?.id})!`,
    );
  }

  const isTestnet = dropData.chainId !== 8453;
  const bundledVariantIds =
    !isTestnet && productData.variantBySelectedOptions.metafield?.value
      ? (JSON.parse(
          productData.variantBySelectedOptions.metafield.value,
        ) as string[])
      : [];

  const createCheckoutRes = await createCheckout({
    customAttributes: [
      { key: "Ethereum Address", value: expectedUserAddress },
      { key: "mintTxHash", value: mintTxHash },
      { key: "farcasterFid", value: farcasterFid.toString() },
    ],
    lineItems: [
      {
        variantId: productData.variantBySelectedOptions.id,
        quantity: 1,
      },
      ...bundledVariantIds.map((variantId) => ({ variantId, quantity: 1 })),
    ],
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
