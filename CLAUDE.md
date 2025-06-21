# CLAUDE.md - Stillnest Development Guide

## 🎯 Project Overview
**Project Name**: Stillnest  
**Tagline**: 写真に集中する、静かなSNS (A quiet SNS focused on photography)

### Core Concept
- **Static image-only** social network (no videos, stories, or reels)
- **No visible metrics** (likes count, follower count hidden)
- **Gallery-first approach** with flexible layout options
- **Quiet appreciation culture** without mandatory comments

### Target Users
1. **Amateur photographers** seeking creative expression
2. **Photo enthusiasts** who want to quietly enjoy others' work
3. **Photography groups** for collaborative exhibitions

## 🏗️ Technical Architecture

### Tech Stack
```
Frontend:
- Next.js 14+ (App Router)
- React 18+
- Tailwind CSS
- TypeScript

Backend:
- Supabase (Database + Auth + Storage)
- PostgreSQL
- Edge Functions (if needed)

Image Handling:
- Cloudflare Images or Imgix for optimization
- Support for high-quality uploads

Hosting:
- Vercel (frontend)
- Supabase (backend services)
```

## 📁 Project Structure
```
stillnest/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── gallery/           # User galleries
│   ├── discover/          # Discovery/explore
│   └── settings/          # User settings
├── components/
│   ├── ui/               # Reusable UI components
│   ├── gallery/          # Gallery-specific components
│   └── upload/           # Upload components
├── lib/
│   ├── supabase/         # Supabase client & helpers
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript definitions
└── public/               # Static assets
```

## 🗄️ Database Schema

### Core Tables
```sql
-- Users table (extended from Supabase auth)
users (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  equipment TEXT,
  created_at TIMESTAMP
)

-- Photos table
photos (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT,
  caption TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  tags TEXT[],
  series_id UUID,
  display_order INTEGER,
  created_at TIMESTAMP
)

-- Series/Albums
series (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  cover_photo_id UUID,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)

-- Likes (count hidden from users)
likes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  photo_id UUID REFERENCES photos(id),
  created_at TIMESTAMP,
  UNIQUE(user_id, photo_id)
)

-- Follows
follows (
  id UUID PRIMARY KEY,
  follower_id UUID REFERENCES users(id),
  following_id UUID REFERENCES users(id),
  created_at TIMESTAMP,
  UNIQUE(follower_id, following_id)
)
```

## 🎨 UI/UX Guidelines

### Design Principles
1. **Minimalist white-based design** (Apple-inspired)
2. **Pinterest-style masonry grid** for galleries
3. **No visible numbers** (likes, followers)
4. **Focus on the photographs** - minimal UI chrome
5. **Smooth, quiet interactions**

### Key Components
```typescript
// Gallery layout options
type LayoutStyle = 'masonry' | 'grid' | 'single-column';

// Photo display component
interface PhotoCardProps {
  photo: Photo;
  showTitle?: boolean;
  showCaption?: boolean;
  enableLike?: boolean;
}

// Gallery customization
interface GallerySettings {
  layout: LayoutStyle;
  photoOrder: 'custom' | 'chronological' | 'reverse-chronological';
  showCaptions: boolean;
  theme: 'light' | 'dark';
}
```

## 🚀 Implementation Phases

### Phase 1: POC (1 month)
- [ ] Basic auth with Supabase
- [ ] Photo upload functionality
- [ ] Simple gallery view
- [ ] User profile page
- [ ] Basic masonry layout

### Phase 2: Alpha (2 months)
- [ ] Complete upload flow with metadata
- [ ] Series/album creation
- [ ] Gallery customization options
- [ ] Like functionality (hidden count)
- [ ] Follow system
- [ ] Discovery page

### Phase 3: Beta (1 month)
- [ ] Performance optimization
- [ ] Advanced gallery layouts
- [ ] Tag-based discovery
- [ ] Privacy settings
- [ ] User testing feedback implementation

### Phase 4: Release (1 month)
- [ ] Group galleries (collaborative)
- [ ] Enhanced discovery algorithms
- [ ] Export features
- [ ] Polish and bug fixes

## 🔑 Key Features Implementation

### 1. Photo Upload
```typescript
// Upload flow
1. Select images (multiple allowed)
2. Add metadata (title, caption, tags)
3. Choose series/create new
4. Set display order
5. Publish or save as draft
```

### 2. Gallery Display
```typescript
// Gallery options for users
- Layout style selection
- Custom photo ordering
- Series organization
- Featured photos pinning
- Theme customization
```

### 3. Discovery System
```typescript
// Discovery algorithms (no engagement metrics)
- Recent uploads
- Random selection from lesser-known users
- Tag-based exploration
- Curated collections (manual)
```

### 4. Privacy & Settings
```typescript
// User controls
- Gallery visibility (public/private)
- Who can follow
- Export own data
- Delete account
```

## 🛡️ Security & Performance

### Security Measures
- Row Level Security (RLS) in Supabase
- Image validation and sanitization
- Rate limiting on uploads
- EXIF data handling (privacy option)

### Performance Optimization
- Lazy loading for images
- Progressive image loading
- CDN integration
- Efficient database queries
- Client-side caching

## 📝 Development Notes

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
CLOUDFLARE_IMAGES_API_TOKEN=
```

### Key Decisions
1. **No comments initially** - maintain quiet atmosphere
2. **No public metrics** - prevent gamification
3. **Quality over quantity** - thoughtful upload limits
4. **User autonomy** - full control over gallery presentation

### Future Considerations
- PDF photo book generation
- Offline exhibition support
- Template sharing for layouts
- Non-competitive themed events
- API for third-party apps

## 🚦 Success Metrics (Internal Only)
- User retention (not public)
- Upload quality indicators
- Gallery visit duration
- Feature usage patterns

---

**Remember**: The goal is to create a peaceful space for photography appreciation, free from the pressures of social media metrics and engagement algorithms.