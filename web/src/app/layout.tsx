import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const font = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "FreelanceFlow — Multi-Platform Freelance Automation",
  description: "AI-powered job hunting across RemoteOK, WeWorkRemotely, and more. Find better freelance jobs, generate proposals, and win more clients.",
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
