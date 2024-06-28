import "server-only";
import { db } from "@/server/db";
import { getProductData } from "@/lib/shopApi";

export const getDropProductData = async (dropId: number) => {
  const dropData = await db.query.DropsTable.findFirst({
    where: (drops, { eq }) => eq(drops.id, dropId),
  });
  if (!dropData) {
    return null;
  }

  const productData = await getProductData(dropData.shopifyProductId);

  return { dropData, productData };
};
