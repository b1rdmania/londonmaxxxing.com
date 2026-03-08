import PubsPageClient from "@/components/PubsPageClient";

export const metadata = {
  title: "london tech heatmap 🍺",
  description: "where london tech happens. vcs, ai labs, fintech, web3.",
  openGraph: {
    title: "london tech heatmap 🍺",
    description: "where london tech happens. vcs, ai labs, fintech, web3.",
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
    title: "london tech heatmap 🍺",
    description: "where london tech happens. vcs, ai labs, fintech, web3.",
    images: ["/pubs-og.jpg"]
  }
};

export default function PubsPage() {
  return <PubsPageClient />;
}
