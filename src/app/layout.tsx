import type { Metadata } from "next";
import { Instrument_Sans, Alex_Brush } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import ClickSpark from "@/components/ui/ClickSpark";
import PageLoader from "@/components/ui/PageLoader";
import "./globals.css";

// Instrument Sans is variable by default, ensuring all weights 400-700 are available
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const alexBrush = Alex_Brush({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-signature",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Voyage",
  description: "We are a digital product agency that creates custom software solutions for businesses of all sizes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <html lang="en" data-scroll-behavior="smooth" className={`${instrumentSans.variable} ${alexBrush.variable}`}>
      <head>
        <link rel="preload" href="/videos/clouds.mp4" as="video" type="video/mp4" />
      </head>
      <body>
        <PageLoader />
        <ClickSpark sparkColor="#ffffff" autoColor sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
          {children}
        </ClickSpark>
        <Analytics />
      </body>
    </html>
  );
}
