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
    icon: [
      { url: "/brand/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/brand/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  metadataBase: new URL("https://gembull-testnet.vercel.app"),
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
