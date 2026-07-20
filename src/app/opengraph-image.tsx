import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 50% 35%, #7c2d12 0%, #1c0a03 45%, #0a0a0a 100%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 130 }}>🔥</div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: -2,
            background: "linear-gradient(90deg, #fdba74, #f97316, #ef4444)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Wiclos
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 32, color: "#d4d4d4" }}>
          Politique, argent, amour : les sujets qui fâchent, entre 8 inconnus.
        </div>
      </div>
    ),
    size,
  );
}
