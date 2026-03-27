"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Home, Search, Library, Radio, Activity, Trophy, Mic2, Crown, LogOut, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LoggedInUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface MobileNavProps {
  user: LoggedInUser | null;
  onLogout: () => void;
}

const featuresLinks = [
  { href: "/home/rooms", label: "Dinleme Odaları", icon: Radio },
  { href: "/home/feed", label: "Aktivite", icon: Activity },
  { href: "/home/leaderboard", label: "Liderler", icon: Trophy },
  { href: "/home/premium", label: "Premium", icon: Crown },
];

const mainLinks = [
  { href: "/home", label: "Ana Sayfa", icon: Home },
  { href: "/home/library", label: "Kitaplığın", icon: Library },
];

export function MobileNav({ user, onLogout }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

  const handleNavigation = () => {
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link href="/home" className="flex-shrink-0">
          <Logo />
        </Link>

        {/* User Profile (Desktop for mobile) */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full p-2" disabled={!user}>
                <Avatar className="h-8 w-8 border border-primary/20">
                  <AvatarImage src={user?.avatar} alt={user?.username} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                    {user ? user.username.substring(0, 2).toUpperCase() : '??'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-card/95 backdrop-blur-xl border-white/10" align="end" side="bottom">
              <DropdownMenuLabel className="font-semibold text-sm py-2">{user?.username || 'Hesabım'}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem asChild className="p-2 cursor-pointer focus:bg-primary/20">
                <Link href="/home/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span className="text-sm">Profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="p-2 cursor-pointer focus:bg-primary/20">
                <Link href="/home/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span className="text-sm">Ayarlar</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={onLogout} className="p-2 cursor-pointer text-red-400 focus:bg-red-500/10 text-sm">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Çıkış Yap</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="border-t border-white/5 bg-background/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Main Links */}
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleNavigation}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}

            <div className="my-2 border-t border-white/5" />

            {/* Features Submenu */}
            <div>
              <button
                onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isFeaturesOpen
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <span>Özellikler</span>
                <svg
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isFeaturesOpen && "rotate-180"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>

              {isFeaturesOpen && (
                <div className="mt-1 ml-4 space-y-1 border-l border-white/10 pl-3">
                  {featuresLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={handleNavigation}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors",
                        pathname === link.href
                          ? "bg-primary/20 text-primary"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
