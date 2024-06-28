import "server-only";
import { db } from "@/server/db";
import { getShopifyProductData } from "@/lib/shopApi";
import { SelectedOptionInput } from "@shopify/hydrogen-react/storefront-api-types";

export const getDropProductData = async (dropId: number) => {
  const dropData = await db.query.DropsTable.findFirst({
    where: (drops, { eq }) => eq(drops.id, dropId),
  });
  if (!dropData) {
    return null;
  }

  const productData = await getShopifyProductData(dropData.shopifyProductId);

  return { dropData, productData };
};
