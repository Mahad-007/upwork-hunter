"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import StoreInit from "@/components/StoreInit";

const PUBLIC_ROUTES = ["/"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  return (
    <>
      <StoreInit />
      {isPublic ? (
        <main>{children}</main>
      ) : (
        <>
          <Sidebar />
          <main className="lg:ml-64 min-h-screen p-6 pt-20 lg:pt-6">{children}</main>
        </>
      )}
    </>
  );
}
