"use client";

import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body className="h-full overflow-hidden flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
