import "server-only";
import { db } from "@/server/db";
import { getProductData } from "@/lib/shopApi";

export const getDropProductData = async (dropId: number) => {
  const dropData = await db.query.DropsTable.findFirst({
    where: (drops, { eq }) => eq(drops.id, dropId),
    with: {
      products: true,
    },
  });
  if (!dropData) {
    throw new Error("Drop not found");
  }

  return getProductData(dropData.shopifyProductId);
};
