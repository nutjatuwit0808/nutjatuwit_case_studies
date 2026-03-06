import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Omni-Typhoon Customer Support",
  description: "Hybrid Multi-Agent Customer Support with RAG & VoC Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
