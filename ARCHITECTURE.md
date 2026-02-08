# Admin Panel Architecture - Podcast & Rooms Management

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Admin Dashboard UI                          │
│                   (src/app/yonetim/page.tsx)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┬──────────┬────────┬──────────┬────────────┐  │
│  │   Şarkılar   │Kullanıcı │ Banlar │Podcastlar│Dinl.Odaları│  │
│  │              │          │        │          │            │  │
│  │ ✓ Upload     │ ✓ List   │✓ Ban   │✓ Delete  │✓ Delete    │  │
│  │ ✓ Delete     │ ✓ Stats  │✓ Unban │✓ List    │✓ List      │  │
│  │ ✓ List       │          │        │          │            │  │
│  └──────────────┴──────────┴────────┴──────────┴────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
         ┌────────────────────┼────────────────────┐
         ↓                    ↓                    ↓
    ┌────────────┐     ┌─────────────┐    ┌─────────────┐
    │   Songs    │     │  Podcasts   │    │  Rooms      │
    │   API      │     │   API       │    │  API        │
    └────────────┘     └─────────────┘    └─────────────┘
         ↓                    ↓                    ↓
    ┌────────────┐     ┌─────────────┐    ┌─────────────┐
    │/api/admin/ │     │/api/admin/  │    │/api/admin/  │
    │  songs     │     │  podcasts   │    │  rooms      │
    │            │     │             │    │             │
    │ - GET      │     │ - GET       │    │ - GET       │
    │ - DELETE   │     │ - DELETE    │    │ - DELETE    │
    │ - POST     │     │ - POST*     │    │ - POST*     │
    └────────────┘     └─────────────┘    └─────────────┘
         ↓                    ↓                    ↓
    ┌────────────┐     ┌─────────────┐    ┌─────────────┐
    │  Database  │     │  Database   │    │  Database   │
    │  (songs)   │     │ (podcasts)  │    │(listening_  │
    │  (songs    │     │(podcast_    │    │  rooms)     │
    │   table)   │     │ episodes)   │    │             │
    └────────────┘     └─────────────┘    └─────────────┘
```

## Data Flow - Podcast Deletion

```
┌──────────────────────────────────────────────────────────┐
│ Admin clicks trash icon next to podcast                  │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ AlertDialog shows confirmation                           │
│ "Bu işlem geri alınamaz..."                              │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ Admin clicks "Sil" button                                │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ handleDeletePodcast(podcastId) function called           │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ DELETE /api/admin/podcasts/:id                           │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ Backend:                                                 │
│ 1. Delete from podcast_episodes                          │
│ 2. Delete from podcasts                                  │
│ 3. Delete storage file                                   │
│ 4. Log to admin_logs                                     │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ Return { success: true }                                 │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ Toast notification: "Başarılı - Podcast silindi."       │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ loadAdminData() called                                   │
│ Podcasts list refreshed automatically                    │
└──────────────────────────────────────────────────────────┘
```

## Data Flow - Listening Room Deletion

```
┌──────────────────────────────────────────────────────────┐
│ Admin clicks trash icon next to room                     │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ AlertDialog shows confirmation                           │
│ "Bu işlem geri alınamaz..."                              │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ Admin clicks "Sil" button                                │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ handleDeleteRoom(roomId) function called                 │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ DELETE /api/admin/rooms/:id                              │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ Backend:                                                 │
│ 1. Delete from listening_rooms                           │
│ 2. Log to admin_logs                                     │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ Return { success: true }                                 │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ Toast notification: "Başarılı - Dinleme odası silindi." │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ loadAdminData() called                                   │
│ Rooms list refreshed automatically                       │
└──────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
AdminDashboard
├── Authentication Layer
│   └── Password Check (admin123)
├── Stats Section
│   ├── Total Users
│   ├── Total Songs
│   ├── Total Plays
│   ├── Active Bans
│   └── Recent Signups
└── Tabs Interface
    ├── Songs Tab
    │   ├── Upload Section
    │   └── Songs List
    ├── Users Tab
    │   └── Users List
    ├── Bans Tab
    │   ├── Ban Section
    │   └── Active Bans List
    ├── Podcasts Tab  ← NEW
    │   └── Podcasts List
    │       ├── Title & Creator
    │       ├── Date
    │       └── Delete Button
    ├── Rooms Tab  ← NEW
    │   └── Rooms List
    │       ├── Room Name & Owner
    │       ├── Status Badge
    │       ├── Participant Count
    │       ├── Date
    │       └── Delete Button
    └── Logs Tab
        └── Activity Logs
```

## State Management

```
AdminDashboard State:
{
  // Existing
  password: string
  isAuthenticated: boolean
  songs: Song[]
  users: User[]
  bans: Ban[]
  stats: AdminStats
  loading: boolean
  selectedFile: File | null
  songTitle: string
  songArtist: string
  banUserId: string
  banReason: string
  banType: 'temporary' | 'permanent'
  banDays: string
  
  // NEW
  podcasts: Podcast[]        ← NEW STATE
  rooms: ListeningRoom[]     ← NEW STATE
}
```

## File Structure

```
src/
├── app/
│   ├── yonetim/
│   │   └── page.tsx (798 lines)
│   │       ├── State: 13 useState hooks
│   │       ├── Effects: 2 useEffect
│   │       ├── Handlers: 8 functions
│   │       │   ├── checkAuth
│   │       │   ├── loadAdminData ✓ UPDATED
│   │       │   ├── handleUploadSong
│   │       │   ├── handleBanUser
│   │       │   ├── handleDeleteSong
│   │       │   ├── handleUnbanUser
│   │       │   ├── handleDeletePodcast ← NEW
│   │       │   └── handleDeleteRoom ← NEW
│   │       ├── UI: 6 Tabs
│   │       │   ├── Songs
│   │       │   ├── Users
│   │       │   ├── Bans
│   │       │   ├── Podcasts ← NEW
│   │       │   ├── Rooms ← NEW
│   │       │   └── Logs
│   │       └── Interfaces: 5
│   │           ├── Song
│   │           ├── User
│   │           ├── Ban
│   │           ├── Podcast ← NEW
│   │           └── ListeningRoom ← NEW
│   └── api/
│       └── admin/
│           ├── podcasts/
│           │   ├── route.ts (GET)
│           │   └── [id]/route.ts (DELETE) ← NEW
│           ├── rooms/
│           │   ├── route.ts (GET)
│           │   └── [id]/route.ts (DELETE) ← NEW
│           ├── songs/
│           ├── users/
│           ├── bans/
│           └── stats/
└── ...
```

## Database Relationships

```
┌─────────────────────────────────────────────────────────┐
│                    PODCASTS                             │
├─────────────────────────────────────────────────────────┤
│ id (UUID)                                               │
│ title (string)                                          │
│ creator_id (UUID) → auth.users.id                       │
│ description (text)                                      │
│ cover_url (string)                                      │
│ storage_url (string)                                    │
│ created_at (timestamp)                                  │
│ updated_at (timestamp)                                  │
└─────────────────────────────────────────────────────────┘
         ↓ (1-to-many)
┌─────────────────────────────────────────────────────────┐
│              PODCAST_EPISODES                           │
├─────────────────────────────────────────────────────────┤
│ id (UUID)                                               │
│ podcast_id (UUID) → podcasts.id CASCADE DELETE         │
│ title (string)                                          │
│ ...                                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              LISTENING_ROOMS                            │
├─────────────────────────────────────────────────────────┤
│ id (UUID)                                               │
│ room_name (string)                                      │
│ created_by (UUID) → auth.users.id                       │
│ is_active (boolean)                                     │
│ current_song (UUID)                                     │
│ participant_count (integer)                             │
│ created_at (timestamp)                                  │
│ updated_at (timestamp)                                  │
└─────────────────────────────────────────────────────────┘
         ↓ (1-to-many)
┌─────────────────────────────────────────────────────────┐
│              ROOM_PARTICIPANTS                          │
├─────────────────────────────────────────────────────────┤
│ id (UUID)                                               │
│ room_id (UUID) → listening_rooms.id CASCADE DELETE     │
│ ...                                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                ADMIN_LOGS                               │
├─────────────────────────────────────────────────────────┤
│ id (UUID)                                               │
│ admin_id (UUID) → auth.users.id                         │
│ action_type (enum)                                      │
│ description (text)                                      │
│ created_at (timestamp)                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Key Features

### ✅ Implemented
- Podcast listing with details
- Podcast deletion with cascade (episodes + storage)
- Room listing with status
- Room deletion with confirmation
- Admin logging
- Toast notifications
- Dark theme styling
- TypeScript interfaces
- Error handling

### 📋 Ready for Enhancement
- Batch operations (multi-select)
- Search/filter functionality
- Editing capabilities
- Advanced statistics
- Export functionality

---

*Generated: 2024*
*Project: Yerli Spotify - Turkish Music Streaming Platform*
