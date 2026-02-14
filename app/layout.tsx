import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Vibe & Sell — Build Your Product, Find Your Customers",
  description:
    "Describe your product and get real customers with personalized emails — or create a pitch page for any target company.",
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
