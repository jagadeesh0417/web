import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Akradhii",
    short_name: "Akradhii",
    description: "Akradhii provides website development, digital marketing, AI automation and CRM solutions.",
    start_url: "/",
    display: "standalone",
    background_color: "#090A0D",
    theme_color: "#090A0D",
    icons: [
      { src: "/logo.png", sizes: "1024x1024", type: "image/png" },
    ],
  };
}