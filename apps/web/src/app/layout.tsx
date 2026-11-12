import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GemBull — The meme runs on rituals",
  description:
    "A NEAR-native meme token concept with contract-enforced daily check-ins, streaks and supply rules. Stock reserve visuals are simulated.",
  icons: {
    icon: "/brand/icons/gembull-app-icon.png",
    apple: "/brand/icons/gembull-app-icon.png",
  },
  ...(process.env.NEXT_PUBLIC_SITE_URL
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) }
    : {}),
  openGraph: {
    title: "GemBull — The meme runs on rituals",
    description:
      "The rituals move the treasury. A NEAR Hackathon prototype with contract-enforced daily rules.",
    images: [{ url: "/brand/gembull-open-graph.png", width: 1734, height: 907, alt: "GemBull — The meme runs on rituals" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GemBull — The meme runs on rituals",
    images: ["/brand/gembull-open-graph.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body>
        <noscript>
          <style>
            {
              "[data-reveal]{opacity:1!important;transform:none!important}path[data-reveal-path]{stroke-dasharray:none!important;stroke-dashoffset:0!important}"
            }
          </style>
        </noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
