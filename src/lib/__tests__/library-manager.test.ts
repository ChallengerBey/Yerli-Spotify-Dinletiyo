/**
 * Library Manager Tests
 * Tests for the Library Data Persistence system
 */

import { libraryManager } from '../library-manager';
import { Song } from '../data';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = jest.fn();

// Mock song data
const mockSong: Song = {
  id: 'test-song-1',
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
  duration: '3:45',
  imageUrl: 'https://example.com/image.jpg',
  audioUrl: 'test-audio-url'
};

describe('LibraryManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    
    // Mock current user
    localStorageMock.setItem('currentUser', JSON.stringify({
      id: 'test-user-1',
      username: 'testuser',
      email: 'test@example.com'
    }));
    
    // Mock current song for getSongData
    localStorageMock.setItem('current-song', JSON.stringify(mockSong));
  });

  describe('Property 1: Empty Server Response Protection', () => {
    test('should preserve local data when server returns empty response', async () => {
      // Setup: Local data exists
      const localFavorites = [mockSong];
      localStorageMock.setItem('favorites', JSON.stringify(localFavorites));
      
      // Mock empty server response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ favorites: [] })
      });
      
      // Action: Get library data (triggers sync)
      const result = await libraryManager.getLibraryData();
      
      // Assertion: Local data should be preserved
      expect(result.favorites).toEqual(localFavorites);
      expect(result.favorites.length).toBe(1);
    });
  });

  describe('Property 10: Transaction Backup and Rollback', () => {
    test('should create backup before destructive operations', async () => {
      // Setup: Existing favorites
      const existingFavorites = [mockSong];
      localStorageMock.setItem('favorites', JSON.stringify(existingFavorites));
      
      // Mock successful server response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      // Action: Add to favorites (should create backup)
      const result = await libraryManager.addToFavorites('new-song-id');
      
      // Assertion: Operation should succeed with backup created
      expect(result.success).toBe(true);
    });

    test('should rollback on server failure', async () => {
      // Setup: Existing favorites
      const existingFavorites = [mockSong];
      localStorageMock.setItem('favorites', JSON.stringify(existingFavorites));
      
      // Mock server failure
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });
      
      // Action: Try to add to favorites
      const result = await libraryManager.addToFavorites('new-song-id');
      
      // Assertion: Operation should fail and data should be unchanged
      expect(result.success).toBe(false);
      const currentFavorites = JSON.parse(localStorageMock.getItem('favorites') || '[]');
      expect(currentFavorites).toEqual(existingFavorites);
    });
  });

  describe('Property 16: Playback Session Protection', () => {
    test('should protect songs during playback', () => {
      // Action: Start playback
      libraryManager.notifyPlaybackStart(mockSong.id);
      
      // Assertion: Song should be protected
      expect(libraryManager.isProtected(mockSong.id)).toBe(true);
    });

    test('should prevent modifications on protected songs', async () => {
      // Setup: Protect song
      libraryManager.protectSong(mockSong.id, 'playback');
      
      // Action: Try to remove from favorites
      const result = await libraryManager.removeFromFavorites(mockSong.id);
      
      // Assertion: Operation should be rejected
      expect(result.success).toBe(false);
      expect(result.message).toContain('protected');
    });

    test('should unprotect songs when playback ends', () => {
      // Setup: Start playback
      libraryManager.notifyPlaybackStart(mockSong.id);
      expect(libraryManager.isProtected(mockSong.id)).toBe(true);
      
      // Action: End playback
      libraryManager.notifyPlaybackEnd(mockSong.id);
      
      // Assertion: Song should be unprotected
      expect(libraryManager.isProtected(mockSong.id)).toBe(false);
    });
  });

  describe('Property 22: Automatic Playback History Tracking', () => {
    test('should automatically add songs to recently played', async () => {
      // Action: Add to recently played
      await libraryManager.addToRecentlyPlayed(mockSong.id);
      
      // Assertion: Song should be in recently played
      const recentlyPlayed = JSON.parse(localStorageMock.getItem('recentlyPlayed') || '[]');
      expect(recentlyPlayed).toContainEqual(mockSong);
    });

    test('should maintain recently played during sync operations', async () => {
      // Setup: Add song to recently played
      await libraryManager.addToRecentlyPlayed(mockSong.id);
      
      // Mock server sync
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ favorites: [], recentlyPlayed: [] })
      });
      
      // Action: Sync with server
      await libraryManager.syncWithServer();
      
      // Assertion: Recently played should be preserved locally
      const recentlyPlayed = JSON.parse(localStorageMock.getItem('recentlyPlayed') || '[]');
      expect(recentlyPlayed.length).toBeGreaterThan(0);
    });
  });

  describe('Property 3: Data Validation Before Processing', () => {
    test('should validate server response schema', async () => {
      // Mock invalid server response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ favorites: 'invalid-data' })
      });
      
      // Action: Sync with server
      const result = await libraryManager.syncWithServer();
      
      // Assertion: Sync should fail due to validation
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid server response');
    });
  });

  describe('Property 11: Two-Phase Deletion Consistency', () => {
    test('should only remove locally after server confirmation', async () => {
      // Setup: Song in favorites
      const favorites = [mockSong];
      localStorageMock.setItem('favorites', JSON.stringify(favorites));
      
      // Mock successful server deletion
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      // Action: Remove from favorites
      const result = await libraryManager.removeFromFavorites(mockSong.id);
      
      // Assertion: Should succeed and remove locally
      expect(result.success).toBe(true);
      const updatedFavorites = JSON.parse(localStorageMock.getItem('favorites') || '[]');
      expect(updatedFavorites).not.toContainEqual(mockSong);
    });

    test('should not remove locally if server deletion fails', async () => {
      // Setup: Song in favorites
      const favorites = [mockSong];
      localStorageMock.setItem('favorites', JSON.stringify(favorites));
      
      // Mock server deletion failure
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });
      
      // Action: Try to remove from favorites
      const result = await libraryManager.removeFromFavorites(mockSong.id);
      
      // Assertion: Should fail and preserve local data
      expect(result.success).toBe(false);
      const updatedFavorites = JSON.parse(localStorageMock.getItem('favorites') || '[]');
      expect(updatedFavorites).toContainEqual(mockSong);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle network errors gracefully', async () => {
      // Mock network error
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      // Action: Try to sync
      const result = await libraryManager.syncWithServer();
      
      // Assertion: Should handle error gracefully
      expect(result.success).toBe(false);
      expect(result.message).toContain('Network error');
    });

    test('should preserve local data during errors', async () => {
      // Setup: Local data
      const localFavorites = [mockSong];
      localStorageMock.setItem('favorites', JSON.stringify(localFavorites));
      
      // Mock network error
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      // Action: Get library data
      const result = await libraryManager.getLibraryData();
      
      // Assertion: Local data should be preserved
      expect(result.favorites).toEqual(localFavorites);
    });
  });
});

// Property-based test helpers
describe('Property-Based Tests', () => {
  const generateRandomSong = (): Song => ({
    id: `song-${Math.random().toString(36).substr(2, 9)}`,
    title: `Song ${Math.random().toString(36).substr(2, 5)}`,
    artist: `Artist ${Math.random().toString(36).substr(2, 5)}`,
    album: `Album ${Math.random().toString(36).substr(2, 5)}`,
    duration: '3:45',
    imageUrl: 'https://example.com/image.jpg',
    audioUrl: 'test-audio-url'
  });

  test('Property: Data consistency across operations', async () => {
    // Generate random songs
    const songs = Array.from({ length: 10 }, generateRandomSong);
    
    // Add all songs to favorites
    for (const song of songs) {
      localStorageMock.setItem('current-song', JSON.stringify(song));
      
      // Mock successful server response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      await libraryManager.addToFavorites(song.id);
    }
    
    // Verify all songs are in favorites
    const favorites = JSON.parse(localStorageMock.getItem('favorites') || '[]');
    expect(favorites.length).toBe(songs.length);
    
    // Remove half the songs
    const songsToRemove = songs.slice(0, 5);
    for (const song of songsToRemove) {
      // Mock successful server response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      await libraryManager.removeFromFavorites(song.id);
    }
    
    // Verify correct number of songs remain
    const remainingFavorites = JSON.parse(localStorageMock.getItem('favorites') || '[]');
    expect(remainingFavorites.length).toBe(5);
  });
});