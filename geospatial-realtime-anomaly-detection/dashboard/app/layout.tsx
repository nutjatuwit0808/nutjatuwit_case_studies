import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Geo-Stream: Real-time Anomaly Detection",
  description: "Live vehicle GPS monitoring with AI anomaly detection",
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
