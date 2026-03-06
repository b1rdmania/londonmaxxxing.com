import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "LONDONMAXXXING // Infrastructure Map of London Tech Ecosystem",
  description: "Real-time map of London's tech infrastructure: 27 VCs, 14 AI companies, 15 fintechs, 24 Web3 firms, office availability, and founder hubs. Data-first directory for builders.",
  openGraph: {
    title: "LONDONMAXXXING // London Tech Infrastructure Map",
    description: "84 verified companies. VCs, AI, fintech, Web3, coworking. Raw data for builders.",
    url: "https://londonmaxxxing.com",
    siteName: "LONDONMAXXXING",
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
    title: "LONDONMAXXXING // London Tech Infrastructure",
    description: "Map of London tech: VCs, AI, fintech, Web3, offices. Data for builders.",
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
