import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "london tech heatmap 🔥",
  description: "where london tech happens. vcs, ai labs, fintech, web3. raw data, real addresses.",
  openGraph: {
    title: "london tech heatmap 🔥",
    description: "where london tech happens. vcs, ai labs, fintech, web3. raw data, real addresses.",
    url: "https://londonmaxxxing.com",
    siteName: "london tech heatmap",
    images: [
      {
        url: "/og-image.png", // Placeholder - user will create
        width: 1200,
        height: 630,
        alt: "London Tech Ecosystem Map"
      }
    ],
    locale: "en_GB",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "london tech heatmap 🔥",
    description: "where london tech happens. vcs, ai labs, fintech, web3. raw data, real addresses.",
    images: ["/og-image.png"] // Placeholder - user will create
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
