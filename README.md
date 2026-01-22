# Lokal Beats - Music Player

A modern, feature-rich music streaming mobile application built with React Native and Expo. Stream music from the Saavn API, manage playlists, control playback with advanced features, and enjoy a beautiful user interface with smooth animations.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Configuration](#configuration)
- [Usage](#usage)
- [Trade-offs & Design Decisions](#trade-offs--design-decisions)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Playback

- **Audio Streaming**: Stream music directly from Saavn API
- **Playback Controls**: Play, pause, skip forward/backward, seek
- **Queue Management**: Create, reorder, and manage playlists
- **Repeat Modes**: Support for repeat off, repeat all, repeat one
- **Shuffle Mode**: Randomize playback order

### Music Discovery

- **Search Functionality**: Search songs, artists, and albums via Saavn API
- **Recently Played**: Track and display recently played songs
- **Song Suggestions**: Get recommendations based on current song

### User Interface

- **Beautiful Design**: Dark-themed, modern UI with smooth animations
- **Mini Player**: Compact player visible in bottom tabs
- **Full Player Screen**: Detailed playback interface with album art and controls
- **Queue Screen**: Manage songs in queue with drag-and-drop
- **Search Screen**: Intuitive music discovery interface
- **Animated Interactions**: Spring animations for tab icons and UI elements
- **Responsive Layout**: Adapts to different screen sizes

### Persistent State

- **AsyncStorage Integration**: Save queue, current track, playback modes
- **State Recovery**: Resume playback from last position
- **Download Management**: Track downloaded songs locally

## Tech Stack

### Core Framework

- **React Native** 0.81.5 - Cross-platform mobile development
- **Expo** 54.0.31 - Managed React Native framework
- **TypeScript** 5.9.2 - Type-safe development
- **React** 19.1.0 - UI library

### State Management & Navigation

- **Zustand** 5.0.10 - Lightweight state management
- **React Navigation** 7.x - Navigation and routing
  - Bottom Tabs Navigator
  - Native Stack Navigator
  - Navigation Elements

### Audio & Media

- **React Native Track Player** 4.1.2 - Advanced audio playback
- **Expo AV** 16.0.8 - Audio/video playback (fallback)
- **Expo File System** 19.0.21 - Local file system access

### UI & Animation

- **React Native Reanimated** 4.1.1 - High-performance animations
- **Expo Linear Gradient** 15.0.8 - Gradient backgrounds
- **Expo Blur** 15.0.8 - Blur effects
- **Shopify React Native Skia** 2.4.14 - Advanced graphics
- **React Native Gesture Handler** 2.28.0 - Gesture detection
- **React Native Slider** 5.1.2 - Playback progress slider

### Icons & Images

- **Expo Vector Icons** 15.0.3 - Material Design, FontAwesome icons
- **React Native Vector Icons** 10.3.0 - Vector icon library
- **Expo Image** 3.0.11 - Advanced image handling
- **React Native Image Colors** 2.5.1 - Dominant color extraction
- **Expo Linear Gradient** - Visual effects

### Data & Storage

- **AsyncStorage** 2.2.0 - Local persistent storage
- **Expo File System** - File system operations

### API Integration

- **Saavn API** - Music streaming data (https://saavn.sumit.co)

## Project Structure

```
music-player/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── MiniPlayer.tsx   # Compact player component
│   ├── constants/           # App constants
│   │   └── tokens.ts        # Colors, fonts, spacing
│   ├── helpers/             # Utility functions
│   │   ├── filter.ts        # Data filtering utilities
│   │   ├── miscellaneous.ts # Misc utilities
│   │   └── types.ts         # Type definitions
│   ├── navigation/          # Navigation configuration
│   │   └── AppNavigator.tsx # Bottom tab + stack navigation
│   ├── screens/             # Screen components
│   │   ├── HomeScreen.tsx   # Music library & featured songs
│   │   ├── PlayerScreen.tsx # Full player interface
│   │   ├── QueueScreen.tsx  # Queue management
│   │   └── SearchScreen.tsx # Music search
│   ├── services/            # Business logic & API
│   │   ├── api.ts           # Saavn API integration
│   │   └── audioService.ts  # Audio playback service
│   ├── store/               # State management (Zustand)
│   │   ├── musicStore.ts    # Music playback store
│   ├── styles/              # Global styles
│   │   └── index.ts         # Theme tokens
│   ├── types/               # TypeScript type definitions
│   │   └── index.d.ts       # Interface definitions
│   └── utils/               # Utility functions
│       ├── helpers.ts       # Helper functions
│       └── storage.ts       # AsyncStorage utilities
├── assets/
│   ├── app_logo.png         # App icon
├── android/                 # Android native config
├── app.json                 # Expo configuration
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

## Architecture

### State Management Architecture

**Zustand Stores** handle three main concerns:

#### 1. Music Store (`musicStore.ts`)

Manages playback state and controls:

- Current song, playback status (playing/paused)
- Current position and duration
- Queue and queue index
- Shuffle and repeat modes
- Actions: play, pause, skip, shuffle, repeat

#### 2. Library Store (`library.tsx`)

Manages user's music library:

- Available tracks and playlists
- Favorite/rated tracks
- Playlist management
- Local library state

#### 3. Services Layer

**AudioService** (`audioService.ts`):

- Low-level audio playback using Expo AV
- Song loading and playback
- Playback status monitoring
- Audio session management

**API Service** (`api.ts`):

- Saavn API integration for searching
- Song metadata retrieval
- Artist and album information
- Suggestion engine

### Component Architecture

**Navigation Layer** (AppNavigator.tsx):

- Bottom tab navigation (Home, Search, Player, Queue)
- Mini player visible in all tabs except Player screen
- Animated tab bar icons
- Dynamic tab bar visibility

**Screen Components**:

- **HomeScreen**: Displays featured songs and search results
- **PlayerScreen**: Full-screen player with controls and album art
- **QueueScreen**: Manage and reorder playback queue
- **SearchScreen**: Music discovery and search interface

**Reusable Components**:

- **MiniPlayer**: Compact player for bottom tabs
- **AnimatedCard**: Song cards with spring animations
- **AnimatedQueueItem**: Queue items with interactive controls

### Data Flow

```
User Input (UI)
    ↓
Navigation/Screen Components
    ↓
Zustand Stores (musicStore, libraryStore)
    ↓
Services (AudioService, API)
    ↓
Native APIs / External APIs (Saavn)
    ↓
Update Store → Re-render Components
```

### Persistence Strategy

**AsyncStorage** handles:

1. Queue state - Save for app resume
2. Current index - Remember playback position
3. Shuffle/Repeat modes - User preferences
4. Recently played - Song history
5. Downloaded songs - Local file references

**Flow**: On app launch, `AppNavigator.useEffect` calls `initializeFromStorage()` to restore state.

## Setup Instructions

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** (for Android development) or **Xcode** (for iOS)
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd music-player
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install Expo CLI** (if not already installed)
   ```bash
   npm install -g expo-cli
   ```

### Running the App

**Development Mode** (Web/Expo):

```bash
npm start
# or
expo start
```

This opens the Expo Metro interface. Choose:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser

**Android Native Build**:

```bash
npm run android
# or
expo run:android
```

**iOS Native Build**:

```bash
npm run ios
# or
expo run:ios
```

**Web**:

```bash
npm run web
```

### Development Environment

**TypeScript Type Checking**:
TypeScript is configured in strict mode. Check types with your IDE or run:

```bash
tsc --noEmit
```

**ESLint**:
Code quality checks are configured:

```bash
npx eslint src/
```

## Configuration

### Expo Configuration (`app.json`)

```json
{
  "expo": {
    "name": "Lokal Beats",
    "slug": "music-player",
    "version": "1.0.0",
    "orientation": "portrait",
    "newArchEnabled": true,
    "userInterfaceStyle": "dark"
  }
}
```

### Android Permissions (`app.json`)

The app requires:

- `READ_EXTERNAL_STORAGE` - Access music files
- `WRITE_EXTERNAL_STORAGE` - Download songs
- `FOREGROUND_SERVICE` - Background playback
- `WAKE_LOCK` - Prevent sleep during playback

### API Configuration

**Saavn API Base URL**: `https://saavn.sumit.co`

Update in [src/services/api.ts](src/services/api.ts#L3) if using a different endpoint.

### Theme & Constants

Customize app appearance in [src/constants/tokens.ts](src/constants/tokens.ts):

- Colors (primary, background, text)
- Font sizes
- Spacing values

## Usage

### Basic Playback

```typescript
import { useMusicStore } from "./store/musicStore";
import audioService from "./services/audioService";

const YourComponent = () => {
  const { setQueue } = useMusicStore();

  const playMusic = async (song: Song, songList: Song[], index: number) => {
    setQueue(songList, index);
    await audioService.loadAndPlay(song);
  };
};
```

### Searching Music

```typescript
import { searchSongs } from "./services/api";

const results = await searchSongs("Imagine Dragons", 1);
console.log(results.data.results); // Array of Song objects
```

### Managing Queue

```typescript
const { queue, playNext, playPrevious, reorderQueue } = useMusicStore();

// Reorder songs in queue
reorderQueue(0, 2); // Move first song to position 2

// Skip to next
playNext();

// Go back
playPrevious();
```

### Accessing Recently Played

```typescript
import { getRecentlyPlayed } from "./utils/storage";

const recent = await getRecentlyPlayed();
console.log(recent); // Array of recently played songs
```

## Trade-offs & Design Decisions

### 1. **Zustand vs Context API**

**Decision**: Use Zustand for state management

**Rationale**:

- ✅ Lightweight and performant (smaller bundle)
- ✅ Minimal boilerplate compared to Context
- ✅ Better TypeScript support
- ✅ Simpler subscription model for partial updates

**Trade-off**:

- ❌ Less built-in tooling compared to Redux
- ❌ Smaller community than Redux/Context

### 2. **Expo-AV vs React Native Track Player**

**Decision**: Use both strategically

**Current**: Primary implementation with Expo-AV in `AudioService`

**Rationale**:

- ✅ Expo-AV is simpler and maintained by Expo team
- ✅ Better integration with Expo ecosystem
- ✅ Sufficient for basic streaming needs

**Trade-off**:

- ❌ Limited background control compared to Track Player
- ❌ Fewer advanced playback features

**Note**: `react-native-track-player` is installed but not actively used. Could be adopted for:

- Advanced notification controls
- Lock screen playback controls
- Better background performance

### 3. **Saavn API vs Native Download**

**Decision**: Stream from Saavn API with optional local caching

**Rationale**:

- ✅ No need to bundle music files
- ✅ Access to large music catalog
- ✅ Reduced app size
- ✅ Always up-to-date catalog

**Trade-off**:

- ❌ Requires internet connection
- ❌ Dependent on external API availability
- ❌ Potential licensing/legal considerations

### 4. **Bottom Tabs + Stack Navigation**

**Decision**: Bottom tab navigation with full-screen Player

**Rationale**:

- ✅ Common mobile pattern (familiar to users)
- ✅ Easy access to all sections
- ✅ Mini player shows context in other tabs
- ✅ Player screen provides immersive experience

**Trade-off**:

- ❌ Takes up screen real estate
- ❌ Mini player duplication of controls
- ❌ Extra navigation layer for searching

**Alternative considered**: Full-screen modal player (like Spotify) - would be more immersive but less accessible from other screens.

### 5. **AsyncStorage for Persistence**

**Decision**: Use AsyncStorage instead of SQLite

**Rationale**:

- ✅ Simple key-value storage for app state
- ✅ Built-in Expo support
- ✅ Sufficient for queue/preferences
- ✅ No schema management needed

**Trade-off**:

- ❌ Not suitable for large datasets
- ❌ No querying capabilities
- ❌ Slower than SQLite for complex data

**Future improvement**: Switch to SQLite for large playlists or music library.

### 6. **No Redux/Thunks for Async Operations**

**Decision**: Handle async directly in components with hooks

**Rationale**:

- ✅ Simpler code for straightforward async (API calls, file I/O)
- ✅ Zustand supports async actions naturally
- ✅ Less boilerplate
- ✅ Clearer error handling

**Trade-off**:

- ❌ Component-level async can be harder to debug
- ❌ Difficult to share async logic across multiple components
- ❌ No built-in middleware for logging

### 7. **Single Store vs Multiple Stores**

**Decision**: Separate `musicStore` and `libraryStore` stores

**Rationale**:

- ✅ Clear separation of concerns
- ✅ Each store manages its domain
- ✅ Easier to test independently
- ✅ Better performance (components subscribe to specific data)

**Trade-off**:

- ❌ Potential for store inconsistencies
- ❌ Need to coordinate between stores

### 8. **Animations with React Native Reanimated**

**Decision**: Use Reanimated for spring animations

**Rationale**:

- ✅ 60+ FPS smooth animations
- ✅ Native thread execution (off-JS-thread)
- ✅ Better performance than JS-based Animated API
- ✅ Gesture integration

**Trade-off**:

- ❌ Larger bundle size
- ❌ Steeper learning curve
- ❌ Native code dependencies

### 9. **Color Extraction from Album Art**

**Decision**: Generate colors from song ID rather than dynamically from images

**Implementation**: `generateColorsFromSeed()` in PlayerScreen

**Rationale**:

- ✅ Consistent colors (better UX - colors don't flicker)
- ✅ Simpler implementation
- ✅ No image processing overhead
- ✅ Better performance

**Trade-off**:

- ❌ Colors don't match album art
- ❌ Less visually cohesive

**Alternative implemented via `react-native-image-colors`**:
Extract dominant colors from actual album artwork (commented in code) for more authentic visual experience.

### 10. **Mini Player Visibility Logic**

**Decision**: Hide mini player on Player screen, show everywhere else

**Rationale**:

- ✅ More screen real estate for full player
- ✅ Cleaner UI (no duplicate controls)
- ✅ Clear navigation intent

**Trade-off**:

- ❌ Can't access queue/home while in player (must use tabs)
- ❌ Loses context when focusing on player

### Performance Considerations

1. **Image Optimization**: Uses Expo Image for automatic format selection and caching
2. **List Virtualization**: FlatList in Queue/Search screens for efficient rendering
3. **Selective Re-renders**: Zustand subscriptions only re-render affected components
4. **Memoization**: Custom hooks prevent unnecessary recalculations

## Future Enhancements

1. **Offline Mode**: Full offline support with SQLite library
2. **Advanced Search**: Filters, sorting, playlists
3. **Social Features**: Share playlists, see friends' activity
4. **Lyrics Display**: Sync lyrics with playback
5. **Equalizer**: Audio processing and effects
6. **Advanced Notifications**: Lock screen controls, notification integration
7. **Voice Control**: Voice commands for playback
8. **Dark/Light Theme**: Theming support

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Saavn API** - Music data and streaming
- **Expo** - React Native framework
- **React Navigation** - Navigation library
- **Zustand** - State management
