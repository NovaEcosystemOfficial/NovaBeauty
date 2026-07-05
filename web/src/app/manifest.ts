import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NovaBeauty",
    short_name: "NovaBeauty",
    description: "Gestionale PWA mobile-first per estetiste.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FDFAFB",
    theme_color: "#D8A7B1",
    orientation: "portrait",
    categories: ["business", "productivity", "lifestyle"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      },
      {
        src: "/icons/favicon-32.png",
        sizes: "32x32",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
