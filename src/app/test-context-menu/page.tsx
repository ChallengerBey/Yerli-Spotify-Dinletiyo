'use client';

import { Button } from '@/components/ui/button';

export default function TestContextMenuPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Global Context Menu Test</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Test Global Context Menu</h2>
          <p className="text-muted-foreground mb-4">
            Sayfanın herhangi bir yerine sağ tıklayın ve global context menu'yu görün.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-card rounded-lg border">
              <h3 className="font-semibold mb-2">Normal Alan</h3>
              <p>Bu alana sağ tıkladığınızda global context menu açılacak.</p>
            </div>
            
            <div className="p-6 bg-secondary rounded-lg">
              <h3 className="font-semibold mb-2">Farklı Arka Plan</h3>
              <p>Bu alan da global context menu'yu destekler.</p>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Input Alanları (Context Menu Yok)</h2>
          <p className="text-muted-foreground mb-4">
            Bu alanlarda varsayılan browser context menu'su çalışacak.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Text Input</label>
              <input 
                type="text" 
                placeholder="Bu input'a sağ tıklayın - varsayılan menu görünecek"
                className="w-full p-2 border rounded-md bg-background"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Textarea</label>
              <textarea 
                placeholder="Bu textarea'ya sağ tıklayın - varsayılan menu görünecek"
                className="w-full p-2 border rounded-md bg-background h-20"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Keyboard Shortcuts Test</h2>
          <p className="text-muted-foreground mb-4">
            Aşağıdaki klavye kısayollarını test edin:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-card rounded border">
              <strong>Ctrl+H</strong> - Ana Sayfa
            </div>
            <div className="p-4 bg-card rounded border">
              <strong>Ctrl+R</strong> - Analytics Raporu
            </div>
            <div className="p-4 bg-card rounded border">
              <strong>Ctrl+Y</strong> - Yatırımcı Merkezi
            </div>
            <div className="p-4 bg-card rounded border">
              <strong>Ctrl+P</strong> - Profil
            </div>
            <div className="p-4 bg-card rounded border">
              <strong>Ctrl+,</strong> - Ayarlar
            </div>
            <div className="p-4 bg-card rounded border">
              <strong>F5</strong> - Sayfayı Yenile
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Context Menu Özellikleri</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Sayfanın herhangi bir yerine sağ tıklayın</li>
            <li>Input ve textarea alanlarında varsayılan menu çalışır</li>
            <li>ESC tuşu ile menu'yu kapatabilirsiniz</li>
            <li>Menu dışına tıklayarak kapatabilirsiniz</li>
            <li>Klavye kısayolları her zaman çalışır</li>
            <li>Menu ekran dışına taşmaz, otomatik konumlanır</li>
          </ul>
        </div>
      </div>
    </div>
  );
}