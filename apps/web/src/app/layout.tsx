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
  title: "StonkRitual — The meme runs on rituals",
  description:
    "A NEAR-native meme token concept with contract-enforced daily check-ins, streaks and supply rules. Stock reserve visuals are simulated.",
  icons: {
    icon: "/brand/icons/stonkritual-favicon-64.png",
    apple: "/brand/icons/stonkritual-app-icon-512.png",
  },
  ...(process.env.NEXT_PUBLIC_SITE_URL
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) }
    : {}),
  openGraph: {
    title: "StonkRitual — The meme runs on rituals",
    description:
      "The rituals move the treasury. A NEAR Hackathon prototype with contract-enforced daily rules.",
    ...(process.env.NEXT_PUBLIC_SITE_URL
      ? {
          images: [
            {
              url: "/brand/stonkritual-open-graph-1200x630.jpg",
              width: 1200,
              height: 630,
            },
          ],
        }
      : {}),
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
