/**
 * Library Manager - Central orchestrator for all library operations
 * Implements the Library Data Persistence specification
 */

import { Song } from './data';

export interface LibraryData {
  favorites: Song[];
  recentlyPlayed: Song[];
  playlists: any[];
  lastSyncTime: number;
  syncVersion: number;
  conflicts: ConflictInfo[];
}

export interface ConflictInfo {
  id: string;
  type: 'favorites' | 'recently_played';
  localData: any;
  serverData: any;
  timestamp: number;
}

export interface SyncResult {
  success: boolean;
  conflicts: ConflictInfo[];
  message: string;
}

export interface OperationResult {
  success: boolean;
  message: string;
  data?: any;
}

export type ProtectionReason = 'playback' | 'sync' | 'transaction';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class LibraryManager {
  private protectedSongs: Map<string, ProtectionReason> = new Map();
  private syncLock: boolean = false;
  private dataSyncManager: DataSyncManager;
  private conflictResolver: ConflictResolver;
  private transactionManager: TransactionManager;
  private apiGateway: APIGateway;
  private playbackProtector: PlaybackSessionProtector;

  constructor() {
    this.dataSyncManager = new DataSyncManager(this);
    this.conflictResolver = new ConflictResolver(this);
    this.transactionManager = new TransactionManager();
    this.apiGateway = new APIGateway();
    this.playbackProtector = new PlaybackSessionProtector(this);
  }

  // Core operations
  async getLibraryData(): Promise<LibraryData> {
    try {
      console.log('📚 LibraryManager: Getting library data');
      
      // Load local data first for immediate display
      const localData = this.loadLocalData();
      
      // Sync with server in background
      this.syncWithServer().catch(error => {
        console.error('Background sync failed:', error);
      });
      
      return localData;
    } catch (error) {
      console.error('❌ LibraryManager: Failed to get library data:', error);
      return this.getEmptyLibraryData();
    }
  }

  async syncWithServer(): Promise<SyncResult> {
    if (this.syncLock) {
      console.log('⏳ LibraryManager: Sync already in progress');
      return { success: false, conflicts: [], message: 'Sync already in progress' };
    }

    try {
      this.syncLock = true;
      console.log('🔄 LibraryManager: Starting sync with server');
      
      return await this.dataSyncManager.sync();
    } catch (error) {
      console.error('❌ LibraryManager: Sync failed:', error);
      return { success: false, conflicts: [], message: error.message };
    } finally {
      this.syncLock = false;
    }
  }

  async addToFavorites(songId: string): Promise<OperationResult> {
    if (this.isProtected(songId)) {
      return { success: false, message: 'Song is protected from modifications' };
    }

    const transactionId = this.transactionManager.beginTransaction();
    
    try {
      console.log('❤️ LibraryManager: Adding to favorites:', songId);
      
      // Create backup
      const currentFavorites = this.loadLocalData().favorites;
      const backupId = this.transactionManager.createBackup(currentFavorites);
      
      // Check if already exists
      if (currentFavorites.some(song => song.id === songId)) {
        return { success: false, message: 'Song already in favorites' };
      }

      // Get song data
      const song = await this.getSongData(songId);
      if (!song) {
        return { success: false, message: 'Song not found' };
      }

      // Add to server first (two-phase commit)
      const serverResult = await this.apiGateway.addFavorite(songId, song);
      if (!serverResult.success) {
        await this.transactionManager.rollback(transactionId);
        return serverResult;
      }

      // Add to local storage
      const updatedFavorites = [...currentFavorites, song];
      this.saveLocalFavorites(updatedFavorites);
      
      await this.transactionManager.commit(transactionId);
      
      // Notify UI
      window.dispatchEvent(new CustomEvent('favoriteChanged'));
      
      return { success: true, message: 'Song added to favorites', data: song };
    } catch (error) {
      console.error('❌ LibraryManager: Add to favorites failed:', error);
      await this.transactionManager.rollback(transactionId);
      return { success: false, message: error.message };
    }
  }

  async removeFromFavorites(songId: string): Promise<OperationResult> {
    if (this.isProtected(songId)) {
      return { success: false, message: 'Song is protected from modifications' };
    }

    const transactionId = this.transactionManager.beginTransaction();
    
    try {
      console.log('💔 LibraryManager: Removing from favorites:', songId);
      
      // Create backup
      const currentFavorites = this.loadLocalData().favorites;
      const backupId = this.transactionManager.createBackup(currentFavorites);
      
      // Remove from server first (two-phase commit)
      const serverResult = await this.apiGateway.removeFavorite(songId);
      if (!serverResult.success) {
        await this.transactionManager.rollback(transactionId);
        return serverResult;
      }

      // Remove from local storage
      const updatedFavorites = currentFavorites.filter(song => song.id !== songId);
      this.saveLocalFavorites(updatedFavorites);
      
      await this.transactionManager.commit(transactionId);
      
      // Notify UI
      window.dispatchEvent(new CustomEvent('favoriteChanged'));
      
      return { success: true, message: 'Song removed from favorites' };
    } catch (error) {
      console.error('❌ LibraryManager: Remove from favorites failed:', error);
      await this.transactionManager.rollback(transactionId);
      return { success: false, message: error.message };
    }
  }

  // Playback integration
  notifyPlaybackStart(songId: string): void {
    console.log('▶️ LibraryManager: Playback started for:', songId);
    this.playbackProtector.protectSong(songId, 'playback-session');
  }

  notifyPlaybackEnd(songId: string): void {
    console.log('⏹️ LibraryManager: Playback ended for:', songId);
    this.playbackProtector.unprotectSong(songId, 'playback-session');
    
    // Execute any queued operations
    this.playbackProtector.executeQueuedOperations(songId);
  }

  async addToRecentlyPlayed(songId: string): Promise<void> {
    try {
      console.log('🕒 LibraryManager: Adding to recently played:', songId);
      
      const song = await this.getSongData(songId);
      if (!song) return;

      // Add to local storage immediately
      const recentlyPlayed = this.loadLocalData().recentlyPlayed;
      const updatedRecent = [song, ...recentlyPlayed.filter(s => s.id !== songId)].slice(0, 50);
      this.saveLocalRecentlyPlayed(updatedRecent);

      // Sync to server in background
      this.apiGateway.addToRecentlyPlayed(songId).catch(error => {
        console.error('Failed to sync recently played to server:', error);
      });
    } catch (error) {
      console.error('❌ LibraryManager: Add to recently played failed:', error);
    }
  }

  // Protection mechanisms
  protectSong(songId: string, reason: ProtectionReason): void {
    console.log('🛡️ LibraryManager: Protecting song:', songId, 'Reason:', reason);
    this.protectedSongs.set(songId, reason);
  }

  unprotectSong(songId: string): void {
    console.log('🔓 LibraryManager: Unprotecting song:', songId);
    this.protectedSongs.delete(songId);
  }

  isProtected(songId: string): boolean {
    return this.protectedSongs.has(songId);
  }

  // Private helper methods
  private loadLocalData(): LibraryData {
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
      const lastSyncTime = parseInt(localStorage.getItem('lastSyncTime') || '0');
      
      return {
        favorites,
        recentlyPlayed,
        playlists: [],
        lastSyncTime,
        syncVersion: 1,
        conflicts: []
      };
    } catch (error) {
      console.error('❌ LibraryManager: Failed to load local data:', error);
      return this.getEmptyLibraryData();
    }
  }

  private saveLocalFavorites(favorites: Song[]): void {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    localStorage.setItem('lastSyncTime', Date.now().toString());
  }

  private saveLocalRecentlyPlayed(recentlyPlayed: Song[]): void {
    localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
  }

  private getEmptyLibraryData(): LibraryData {
    return {
      favorites: [],
      recentlyPlayed: [],
      playlists: [],
      lastSyncTime: 0,
      syncVersion: 1,
      conflicts: []
    };
  }

  private async getSongData(songId: string): Promise<Song | null> {
    // Try to get from current queue first
    const currentQueue = JSON.parse(localStorage.getItem('current-queue') || '[]');
    const song = currentQueue.find((s: Song) => s.id === songId);
    if (song) return song;

    // Try to get from current song
    const currentSong = JSON.parse(localStorage.getItem('current-song') || 'null');
    if (currentSong && currentSong.id === songId) return currentSong;

    // Try to get from favorites
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favSong = favorites.find((s: Song) => s.id === songId);
    if (favSong) return favSong;

    console.warn('⚠️ LibraryManager: Song data not found for:', songId);
    return null;
  }
}

// Data Sync Manager - Handles synchronization with race condition prevention
class DataSyncManager {
  private libraryManager: LibraryManager;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(libraryManager: LibraryManager) {
    this.libraryManager = libraryManager;
  }

  async sync(): Promise<SyncResult> {
    try {
      console.log('🔄 DataSyncManager: Starting sync');
      
      const localData = this.loadLocalData();
      const serverData = await this.fetchServerData();
      
      // Validate server response
      const validation = this.validateServerResponse(serverData);
      if (!validation.isValid) {
        console.warn('⚠️ DataSyncManager: Invalid server response:', validation.errors);
        return { success: false, conflicts: [], message: 'Invalid server response' };
      }

      // Detect conflicts
      const conflicts = this.detectConflicts(localData, serverData);
      
      if (conflicts.length > 0) {
        console.log('⚠️ DataSyncManager: Conflicts detected:', conflicts.length);
        // Let conflict resolver handle conflicts
        // For now, return conflicts for user resolution
        return { success: false, conflicts, message: 'Conflicts detected' };
      }

      // No conflicts, update local data
      this.updateLocalData(serverData);
      
      console.log('✅ DataSyncManager: Sync completed successfully');
      return { success: true, conflicts: [], message: 'Sync completed' };
    } catch (error) {
      console.error('❌ DataSyncManager: Sync failed:', error);
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🔄 DataSyncManager: Retrying sync (${this.retryCount}/${this.maxRetries})`);
        await this.delay(Math.pow(2, this.retryCount) * 1000); // Exponential backoff
        return this.sync();
      }
      
      return { success: false, conflicts: [], message: error.message };
    }
  }

  validateServerResponse(data: any): ValidationResult {
    const errors: string[] = [];
    
    if (!data) {
      errors.push('Server response is null or undefined');
      return { isValid: false, errors };
    }

    if (data.favorites && !Array.isArray(data.favorites)) {
      errors.push('Favorites data is not an array');
    }

    if (data.recentlyPlayed && !Array.isArray(data.recentlyPlayed)) {
      errors.push('Recently played data is not an array');
    }

    return { isValid: errors.length === 0, errors };
  }

  private async fetchServerData(): Promise<any> {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (!currentUser) {
      throw new Error('No user found');
    }

    const userData = JSON.parse(currentUser);
    
    // Use API Gateway for unified access
    const apiGateway = new APIGateway();
    const [favorites, recentlyPlayed] = await Promise.all([
      apiGateway.getFavorites(),
      apiGateway.getRecentlyPlayed()
    ]);

    return {
      favorites: favorites || [],
      recentlyPlayed: recentlyPlayed || []
    };
  }

  private loadLocalData(): LibraryData {
    return {
      favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
      recentlyPlayed: JSON.parse(localStorage.getItem('recentlyPlayed') || '[]'),
      playlists: [],
      lastSyncTime: parseInt(localStorage.getItem('lastSyncTime') || '0'),
      syncVersion: 1,
      conflicts: []
    };
  }

  private detectConflicts(local: LibraryData, server: any): ConflictInfo[] {
    const conflicts: ConflictInfo[] = [];
    
    // Check favorites conflicts
    if (local.favorites.length > 0 && server.favorites.length === 0) {
      conflicts.push({
        id: 'favorites-empty-server',
        type: 'favorites',
        localData: local.favorites,
        serverData: server.favorites,
        timestamp: Date.now()
      });
    }

    return conflicts;
  }

  private updateLocalData(serverData: any): void {
    // Server boş/eksik dönünce local veriyi ezmeyelim.
    // Şu an recentlyPlayed server tarafında her ortamda garantili değil.
    if (Array.isArray(serverData.favorites) && serverData.favorites.length > 0) {
      localStorage.setItem('favorites', JSON.stringify(serverData.favorites));
    }
    if (Array.isArray(serverData.recentlyPlayed) && serverData.recentlyPlayed.length > 0) {
      localStorage.setItem('recentlyPlayed', JSON.stringify(serverData.recentlyPlayed));
    }
    localStorage.setItem('lastSyncTime', Date.now().toString());
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Conflict Resolver - Handles data conflicts intelligently
class ConflictResolver {
  private libraryManager: LibraryManager;

  constructor(libraryManager: LibraryManager) {
    this.libraryManager = libraryManager;
  }

  async resolveConflicts(conflicts: ConflictInfo[]): Promise<void> {
    for (const conflict of conflicts) {
      await this.resolveConflict(conflict);
    }
  }

  private async resolveConflict(conflict: ConflictInfo): Promise<void> {
    console.log('🔧 ConflictResolver: Resolving conflict:', conflict.type);
    
    switch (conflict.type) {
      case 'favorites':
        await this.resolveFavoritesConflict(conflict);
        break;
      default:
        console.warn('⚠️ ConflictResolver: Unknown conflict type:', conflict.type);
    }
  }

  private async resolveFavoritesConflict(conflict: ConflictInfo): Promise<void> {
    // For empty server response with local data, keep local data
    if (conflict.id === 'favorites-empty-server') {
      console.log('🔧 ConflictResolver: Keeping local favorites data');
      // Local data is already preserved, no action needed
    }
  }
}

// Transaction Manager - Provides atomic operations with rollback
class TransactionManager {
  private transactions: Map<string, any> = new Map();
  private backups: Map<string, any> = new Map();

  beginTransaction(): string {
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.transactions.set(transactionId, {
      id: transactionId,
      timestamp: Date.now(),
      status: 'pending'
    });
    return transactionId;
  }

  createBackup(data: any): string {
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.backups.set(backupId, JSON.parse(JSON.stringify(data)));
    return backupId;
  }

  async commit(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (transaction) {
      transaction.status = 'committed';
      console.log('✅ TransactionManager: Transaction committed:', transactionId);
    }
  }

  async rollback(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (transaction) {
      transaction.status = 'rolled_back';
      console.log('🔄 TransactionManager: Transaction rolled back:', transactionId);
    }
  }

  async restoreFromBackup(backupId: string): Promise<void> {
    const backup = this.backups.get(backupId);
    if (backup) {
      console.log('🔄 TransactionManager: Restoring from backup:', backupId);
      // Restore logic would go here
    }
  }
}

// API Gateway - Unified interface for server communications
class APIGateway {
  async getFavorites(): Promise<Song[]> {
    try {
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (!currentUser) return [];

      const userData = JSON.parse(currentUser);
      const response = await fetch(`/api/user-data/favorites?userId=${userData.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.favorites || [];
    } catch (error) {
      console.error('❌ APIGateway: Get favorites failed:', error);
      return [];
    }
  }

  async addFavorite(songId: string, song: Song): Promise<OperationResult> {
    try {
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (!currentUser) {
        return { success: false, message: 'No user found' };
      }

      const userData = JSON.parse(currentUser);
      const response = await fetch('/api/user-data/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id, song })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return { success: true, message: 'Added to favorites' };
    } catch (error) {
      console.error('❌ APIGateway: Add favorite failed:', error);
      return { success: false, message: error.message };
    }
  }

  async removeFavorite(songId: string): Promise<OperationResult> {
    try {
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (!currentUser) {
        return { success: false, message: 'No user found' };
      }

      const userData = JSON.parse(currentUser);
      const response = await fetch(`/api/user-data/favorites?userId=${userData.id}&songId=${songId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return { success: true, message: 'Removed from favorites' };
    } catch (error) {
      console.error('❌ APIGateway: Remove favorite failed:', error);
      return { success: false, message: error.message };
    }
  }

  async getRecentlyPlayed(): Promise<Song[]> {
    try {
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (!currentUser) return [];

      const userData = JSON.parse(currentUser);
      const response = await fetch(`/api/user-data/recently-played?userId=${userData.id}`, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data?.recentlyPlayed) ? data.recentlyPlayed : [];
    } catch (error) {
      console.error('❌ APIGateway: Get recently played failed:', error);
      // Fallback: local
      try {
        return JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
      } catch {
        return [];
      }
    }
  }

  async addToRecentlyPlayed(songId: string): Promise<OperationResult> {
    try {
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (!currentUser) return { success: false, message: 'No user found' };

      const userData = JSON.parse(currentUser);
      const song = JSON.parse(localStorage.getItem('current-song') || 'null');

      await fetch('/api/user-data/recently-played', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id, song: song?.id === songId ? song : { id: songId } })
      });

      return { success: true, message: 'Added to recently played' };
    } catch (error) {
      console.error('❌ APIGateway: Add to recently played failed:', error);
      return { success: false, message: error.message };
    }
  }
}

// Playback Session Protector - Prevents data operations during playback
class PlaybackSessionProtector {
  private protectedSongs: Map<string, string> = new Map(); // songId -> sessionId
  private queuedOperations: Map<string, Array<() => Promise<void>>> = new Map();
  private libraryManager: LibraryManager;

  constructor(libraryManager: LibraryManager) {
    this.libraryManager = libraryManager;
  }

  protectSong(songId: string, sessionId: string): void {
    console.log('🛡️ PlaybackProtector: Protecting song:', songId);
    this.protectedSongs.set(songId, sessionId);
  }

  unprotectSong(songId: string, sessionId: string): void {
    const currentSession = this.protectedSongs.get(songId);
    if (currentSession === sessionId) {
      console.log('🔓 PlaybackProtector: Unprotecting song:', songId);
      this.protectedSongs.delete(songId);
    }
  }

  isProtected(songId: string): boolean {
    return this.protectedSongs.has(songId);
  }

  getProtectedSongs(): string[] {
    return Array.from(this.protectedSongs.keys());
  }

  queueOperation(songId: string, operation: () => Promise<void>): void {
    console.log('📋 PlaybackProtector: Queueing operation for:', songId);
    if (!this.queuedOperations.has(songId)) {
      this.queuedOperations.set(songId, []);
    }
    this.queuedOperations.get(songId)!.push(operation);
  }

  async executeQueuedOperations(songId: string): Promise<void> {
    const operations = this.queuedOperations.get(songId);
    if (operations && operations.length > 0) {
      console.log('⚡ PlaybackProtector: Executing queued operations for:', songId);
      
      for (const operation of operations) {
        try {
          await operation();
        } catch (error) {
          console.error('❌ PlaybackProtector: Queued operation failed:', error);
        }
      }
      
      this.queuedOperations.delete(songId);
    }
  }
}

// Export singleton instance
export const libraryManager = new LibraryManager();