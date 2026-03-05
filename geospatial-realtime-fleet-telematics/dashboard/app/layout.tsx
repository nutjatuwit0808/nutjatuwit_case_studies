import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fleet MVT: Real-time Fleet Telematics",
  description: "200,000 vehicles on map with spatial interpolation MVT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  );
}
