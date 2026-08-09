"use client";

import { usePathname } from "next/navigation";
import { NavPill } from "@/components/layout/NavPill";

// The landing page has no nav bar — it uses a single CTA under the headline
// instead, so the pill only renders on every other route.
export function NavBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-20 flex justify-center px-4">
      <NavPill />
    </div>
  );
}
