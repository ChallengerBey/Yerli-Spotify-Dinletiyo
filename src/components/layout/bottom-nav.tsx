"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Radio, Activity, Trophy, Mic2, Crown, Tv } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", label: "Ana Sayfa", icon: Home },
  { href: "/home/library", label: "Kitaplığın", icon: Library },
  { href: "/home/yayinci", label: "Yayıncı", icon: Tv },
  { href: "/home/feed", label: "Aktivite", icon: Activity },
  { href: "/home/leaderboard", label: "Liderler", icon: Trophy },
  { href: "/home/podcasts", label: "Podcast'ler", icon: Mic2 },
  { href: "/home/premium", label: "Premium", icon: Crown },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      {/* Liquid Glass Effect Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent backdrop-blur-2xl border-t border-white/10" />
      
      {/* Content */}
      <div className="relative px-4 py-3 flex justify-around items-center">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200",
              pathname === item.href
                ? "text-primary bg-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
            title={item.label}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium hidden sm:inline">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
