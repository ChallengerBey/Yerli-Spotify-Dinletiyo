'use client';

import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

export default function DebugContextMenuPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Debug Context Menu</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Simple Context Menu Test</h2>
        <ContextMenu>
          <ContextMenuTrigger>
            <Button variant="default">Right-click me</Button>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              <span>Test Item 1</span>
            </ContextMenuItem>
            <ContextMenuItem>
              <span>Test Item 2</span>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Context Menu on Div</h2>
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="w-64 h-64 bg-secondary rounded-lg flex items-center justify-center cursor-pointer border-2 border-dashed border-border">
              <span className="text-lg">Right-click anywhere in this box</span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              <span>Test Item 1</span>
            </ContextMenuItem>
            <ContextMenuItem>
              <span>Test Item 2</span>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  );
}