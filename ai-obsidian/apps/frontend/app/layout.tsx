import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "AI Obsidian Workshop",
  description: "AI Agent + Obsidian for Software Engineers",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
