import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noted",
  description: "Minimal single-page note-taking app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
