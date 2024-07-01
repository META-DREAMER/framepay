import { ImageResponse } from "next/og";
import { getDropProductData } from "@/lib/dropHelpers";

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
          background: "#f0f0f0",
          fontWeight: "bold",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          paddingLeft: 24,
          paddingRight: 24,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p tw="bg-blue-800 text-6xl font-bold font-mono text-white px-4">
          {drop?.dropData.name}
        </p>
        <p tw="bg-blue-800 text-5xl font-bold text-white px-4">
          {drop?.dropData.ethPrice} ETH
        </p>
        {imageUrl ? (
          <img
            width="1000"
            height="800"
            src={imageUrl || ""}
            style={{
              borderRadius: 12,
              objectFit: "cover",
            }}
          />
        ) : null}
        {bottomText ? (
          <p tw="text-blue-800 text-5xl font-bold mt-8 max-w-[800px] text-center">
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
