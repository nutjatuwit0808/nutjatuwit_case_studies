import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NL2SQL-Lite",
  description: "Text-to-SQL with bilingual support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
