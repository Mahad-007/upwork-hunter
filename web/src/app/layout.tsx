import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import StoreInit from "@/components/StoreInit";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Upwork Hunter — AI Job Matching",
  description: "AI-powered Upwork job hunting assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <StoreInit />
        <Sidebar />
        <main className="lg:ml-64 min-h-screen p-6 pt-16 lg:pt-6">
          {children}
        </main>
      </body>
    </html>
  );
}
