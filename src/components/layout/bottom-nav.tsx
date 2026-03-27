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
  { href: "/home/premium", label: "Premium", icon: Crown },
];

export function BottomNav() {
  return null; // Mobilde artık kullanılmıyor, player içinde navigation var
}
