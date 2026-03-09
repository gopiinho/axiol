"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  PlusCircle,
  FileText,
  BarChart3,
  Settings,
  List,
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    {
      href: "/dashboard",
      icon: Home,
      label: "Home",
    },
    {
      href: "/dashboard/drafts",
      icon: FileText,
      label: "Drafts",
    },
    {
      href: "/dashboard/create",
      icon: PlusCircle,
      label: "Create",
    },
    {
      href: "/dashboard/lists",
      icon: List,
      label: "Lists",
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      label: "Settings",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-50">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  active ? "text-pink-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className={`h-6 w-6 ${active ? "stroke-[2.5]" : ""}`} />
                <span
                  className={`text-xs mt-1 ${
                    active ? "font-semibold" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
