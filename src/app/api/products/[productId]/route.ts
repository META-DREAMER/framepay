import { getShopifyProductData } from "@/lib/shopApi";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { productId: string } },
) {
  const data = await getShopifyProductData(params.productId);
  return NextResponse.json({
    data,
  });
}
