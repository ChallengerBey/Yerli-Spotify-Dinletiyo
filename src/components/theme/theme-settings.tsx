"use client";

import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sun, Moon, Monitor } from "lucide-react";

const ACCENT_COLORS = [
  { name: "Spotify Yeşil", value: "#1db954" },
  { name: "Mavi", value: "#3b82f6" },
  { name: "Mor", value: "#8b5cf6" },
  { name: "Pembe", value: "#ec4899" },
  { name: "Turuncu", value: "#f97316" },
  { name: "Kırmızı", value: "#ef4444" },
  { name: "Sarı", value: "#eab308" },
  { name: "Turkuaz", value: "#06b6d4" },
];

export function ThemeSettings() {
  const { themeMode, accentColor, setThemeMode, setAccentColor } = useTheme();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tema Modu</CardTitle>
          <CardDescription>Arayüz görünümünü seç</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={themeMode}
            onValueChange={(value) => setThemeMode(value as any)}
            className="grid grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem value="light" id="light" className="peer sr-only" />
              <Label
                htmlFor="light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Sun className="mb-3 h-6 w-6" />
                Aydınlık
              </Label>
            </div>

            <div>
              <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
              <Label
                htmlFor="dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Moon className="mb-3 h-6 w-6" />
                Karanlık
              </Label>
            </div>

            <div>
              <RadioGroupItem value="auto" id="auto" className="peer sr-only" />
              <Label
                htmlFor="auto"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Monitor className="mb-3 h-6 w-6" />
                Otomatik
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vurgu Rengi</CardTitle>
          <CardDescription>Ana renk temasını seç</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setAccentColor(color.value)}
                className={`group relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                  accentColor === color.value
                    ? "border-primary"
                    : "border-muted hover:border-muted-foreground"
                }`}
              >
                <div
                  className="h-10 w-10 rounded-full"
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-xs font-medium">{color.name}</span>
                {accentColor === color.value && (
                  <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
