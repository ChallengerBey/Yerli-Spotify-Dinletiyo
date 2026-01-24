'use client';

import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { Play, SkipForward, Repeat, Heart, ListMusic } from 'lucide-react';

export default function TestContextMenuPage() {
  const handlePlay = () => {
    console.log('Play clicked');
  };

  const handlePlayNext = () => {
    console.log('Play Next clicked');
  };

  const handleAddToQueue = () => {
    console.log('Add to Queue clicked');
  };

  const handleAddToPlaylist = () => {
    console.log('Add to Playlist clicked');
  };

  const handleShare = () => {
    console.log('Share clicked');
  };

  const handleRepeatSong = () => {
    console.log('Repeat Song clicked');
  };

  const handleAddToFavorites = () => {
    console.log('Add to Favorites clicked');
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Context Menu Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Context Menu on Button</h2>
        <ContextMenu>
          <ContextMenuTrigger>
            <Button variant="default">Right-click me</Button>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={handlePlay}>
              <Play className="mr-2 h-4 w-4" />
              <span>Çal</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={handlePlayNext}>
              <SkipForward className="mr-2 h-4 w-4" />
              <span>Sonraki Çal</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={handleAddToQueue}>
              <ListMusic className="mr-2 h-4 w-4" />
              <span>Kuyruğa Ekle</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleAddToPlaylist}>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Çalma Listesine Ekle</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={handleShare}>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 2.684a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Paylaş</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleRepeatSong}>
              <Repeat className="mr-2 h-4 w-4" />
              <span>Şarkıyı Tekrarla</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={handleAddToFavorites}>
              <Heart className="mr-2 h-4 w-4" />
              <span>Favorilere Ekle</span>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Test Context Menu on Div</h2>
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="w-64 h-64 bg-secondary rounded-lg flex items-center justify-center cursor-pointer">
              <span className="text-lg">Right-click anywhere in this box</span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={handlePlay}>
              <Play className="mr-2 h-4 w-4" />
              <span>Çal</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={handlePlayNext}>
              <SkipForward className="mr-2 h-4 w-4" />
              <span>Sonraki Çal</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={handleAddToQueue}>
              <ListMusic className="mr-2 h-4 w-4" />
              <span>Kuyruğa Ekle</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleAddToPlaylist}>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Çalma Listesine Ekle</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={handleShare}>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 2.684a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Paylaş</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleRepeatSong}>
              <Repeat className="mr-2 h-4 w-4" />
              <span>Şarkıyı Tekrarla</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={handleAddToFavorites}>
              <Heart className="mr-2 h-4 w-4" />
              <span>Favorilere Ekle</span>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  );
}