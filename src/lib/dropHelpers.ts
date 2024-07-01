import "server-only";
import { db } from "@/server/db";
import { getShopifyProductData } from "@/lib/shopApi";
import { type SelectedOptionInput } from "@shopify/hydrogen-react/storefront-api-types";

export const getDropProductData = async (
  dropId: number,
  selectedOptions?: SelectedOptionInput[],
) => {
  const dropData = await db.query.DropsTable.findFirst({
    where: (drops, { eq }) => eq(drops.id, dropId),
  });
  if (!dropData) {
    return null;
  }

  const productData = await getShopifyProductData(
    dropData.shopifyProductId,
    selectedOptions,
  );

  return { dropData, productData };
};
