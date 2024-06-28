import { type NextRequest, NextResponse } from "next/server";
import { getDropProductData } from "@/lib/dropHelpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { dropId: string } },
) {
  const dropId = params.dropId;

  const dropData = await getDropProductData(parseInt(dropId));

  if (!dropData) {
    return new NextResponse(
      `Drop not found for dropId: ${parseInt(dropId)} ${dropId}`,
      { status: 404 },
    );
  }

  return new NextResponse(JSON.stringify(dropData), {
    headers: {
      "content-type": "application/json",
    },
  });
}

export const revalidate = 0;
