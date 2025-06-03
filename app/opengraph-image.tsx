import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Image metadata
export const alt = "XD :UI - AI / Generic React UI Components";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
  try {
    // Use the existing og-image.png from public folder
    const imageData = await readFile(
      join(process.cwd(), "public/og-image.png")
    );

    return new Response(imageData, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    // Fallback: generate a simple image if the file doesn't exist
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontFamily: "system-ui",
          }}
        >
          <div style={{ fontSize: 64, fontWeight: "bold", marginBottom: 20 }}>
            XD :UI
          </div>
          <div style={{ fontSize: 32, opacity: 0.9 }}>
            AI / Generic React UI Components
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  }
}
