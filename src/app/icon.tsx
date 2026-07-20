import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7c2d12 0%, #431407 100%)",
          borderRadius: 7,
        }}
      >
        <span style={{ fontSize: 22 }}>🔥</span>
      </div>
    ),
    size,
  );
}
