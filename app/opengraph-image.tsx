import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Zeke, Cybersecurity & Software Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Share-link preview card: name on the left, the 3D Zeke poster on the right.
export default async function Image() {
  const poster = await readFile(join(process.cwd(), "public/images/zeke-poster.png"), "base64");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 110px",
          background: "#07120c",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, fontWeight: 700, color: "#e6f2ea", lineHeight: 1 }}>Zeke</div>
          <div style={{ marginTop: 24, fontSize: 40, color: "#4ade80" }}>Cybersecurity & Software Developer</div>
        </div>
        {/* 465x1155 source, scaled to fit the card height */}
        <img src={`data:image/png;base64,${poster}`} width={234} height={580} alt="" />
      </div>
    ),
    size,
  );
}
