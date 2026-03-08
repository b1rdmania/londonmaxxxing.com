import PubsPageClient from "@/components/PubsPageClient";

export const metadata = {
  title: "London Pubs // londonmaxxxing.com",
  description: "485 pubs across London - from City of London to Shoreditch, Soho to Greenwich",
  openGraph: {
    title: "London Pubs 🍺",
    description: "485 pubs across London",
    images: [
      {
        url: "/pubs-og.jpg",
        width: 1200,
        height: 630,
        alt: "London Pubs Map"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "London Pubs 🍺",
    description: "485 pubs across London",
    images: ["/pubs-og.jpg"]
  }
};

export default function PubsPage() {
  return <PubsPageClient />;
}
