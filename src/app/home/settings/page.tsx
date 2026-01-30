import { ThemeSettings } from "@/components/theme/theme-settings";

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">Uygulama tercihlerini yönet</p>
      </div>

      <ThemeSettings />
    </div>
  );
}
