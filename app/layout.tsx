import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Vibe & Sell — Build Product. Talk to Users.",
  description:
    "Build your app, find real people who need it, have conversations, and track your path to product-market fit. Powered by Crustdata.",
  openGraph: {
    title: "Vibe & Sell — Build Product. Talk to Users.",
    description:
      "Build your app, find real people who need it, have conversations, and track your path to product-market fit. Powered by Crustdata.",
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
