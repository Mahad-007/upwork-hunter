import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const font = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Upwork Hunter — AI-Powered Upwork Automation",
  description: "AI-powered Upwork job hunting, proposal generation, and bidding automation. Find better jobs, win more clients.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
