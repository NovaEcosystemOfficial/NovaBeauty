import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "NovaBeauty",
    template: "%s | NovaBeauty"
  },
  description: "Gestionale PWA mobile-first per estetiste.",
  applicationName: "NovaBeauty",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NovaBeauty"
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  },
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#D8A7B1"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
