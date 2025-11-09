import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "SideQuest - Mobile",
  description: "Mobile GPS HUD for SideQuest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function PhoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

