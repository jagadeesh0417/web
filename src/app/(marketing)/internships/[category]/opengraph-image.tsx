import { ImageResponse } from "next/og";
import { CATEGORY_BY_SLUG } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const name = CATEGORY_BY_SLUG[category]?.name ?? "Internship";
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", flexDirection: "column", justifyContent: "center", padding: 90, background: "#312e81", color: "white" }}>
      <div style={{ fontSize: 32 }}>AKRADHII INTERNSHIPS</div>
      <div style={{ fontSize: 72, fontWeight: 700, marginTop: 32 }}>{name}</div>
      <div style={{ fontSize: 30, marginTop: 28 }}>Learn through projects and mentor feedback</div>
    </div>,
    size,
  );
}
