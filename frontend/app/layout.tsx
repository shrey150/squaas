import type { Metadata, Viewport } from "next";
import { Cinzel, Spectral } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "SideQuest Overlay",
  description: "Real-time GPS overlay for streaming",
};

export const viewport: Viewport = {
  width: 1920,
  height: 1080,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cinzel.variable} ${spectral.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
