import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Vibe & Sell — 5 minutes from idea to first customer",
  description:
    "Build your app, analyze your market, find 100 real customers, and write your launch plan. All in under 5 minutes.",
  openGraph: {
    title: "Vibe & Sell — 5 minutes from idea to first customer",
    description:
      "Build your app, analyze your market, find 100 real customers, and write your launch plan. All in under 5 minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-white">
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
