import { ImageResponse } from "next/og";
import { getDropProductData } from "@/lib/dropHelpers";

export const revalidate = 0
export async function GET(
  request: Request,
  { params }: { params: { dropId: string } },
) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("imageUrl");
  const bottomText = searchParams.get("bottomText");
  const drop = await getDropProductData(parseInt(params.dropId));

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          color: "black",
          background: "#ececec",
          fontWeight: "bold",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          paddingLeft: 8,
          paddingRight: 8,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p tw="text-6xl text-blue-800 px-4">
          {drop?.dropData.name}
        </p>
        <p tw="text-5xl text-blue-800 px-4">
          {drop?.dropData.ethPrice} ETH
        </p>
        {imageUrl ? (
          <img
            width="1200"
            height="960"
            src={imageUrl || ""}
            style={{
              borderRadius: 0,
              objectFit: "cover",
            }}
          />
        ) : null}
        {bottomText ? (
          <p tw="text-blue-800 text-5xl font-bold mt-4 max-w-[800px] text-center">
            {bottomText}
          </p>
        ) : null}
      </div>
    ),
    {
      width: 1200,
      height: 1200,
    },
  );
}
