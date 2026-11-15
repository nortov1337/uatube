# UaTube

Self-hosted video platform built with Next.js and Prisma. Upload videos, subscribe to channels, build playlists, comment in threads and pick up watching where you left off — without external services: media lives on disk, metadata in SQLite.

The interface ships in Russian and English, with light and dark themes.

## Features

**Watching**

- Home feed ranked by subscriptions, tags from watch history, popularity and recency
- Search, 13 categories, sorting by date, views or likes
- Custom player: resume, playback speed 0.25×–2×, picture-in-picture, fullscreen, keyboard shortcuts, autoplay of the next video
- Likes, view counter, related videos
- Comment threads with replies and likes; comments can be edited, and deleted by their author or the video owner
- Channel pages with avatar, banner, bio and stats; subscriptions
- Playlists, Watch Later, watch history and Continue Watching
- Notifications for new videos from subscriptions and for comment replies
- Public, unlisted and private videos

**Publishing**

- MP4/WebM upload with progress, up to `MAX_UPLOAD_MB` (200 MB by default)
- JPEG poster upload, metadata editing, visibility switch, deletion
- Studio with a video list and per-video analytics (daily views, likes, comments)
- Settings: name, handle, bio, avatar, banner, password, account deletion

## Tech stack

- Next.js 16 (App Router, React Server Components), React 19
- TypeScript 5, Tailwind CSS 4
- Prisma 6 with SQLite
- `jose` for HS256 session JWTs, `bcryptjs` for password hashing, Zod 4 for validation
- `lucide-react` icons

## Getting started

Requires Node.js 20.9 or newer and npm.

```bash
git clone https://github.com/nortov1337/uatube.git
cd uatube
npm install
```

Create `.env` in the project root:

```dotenv
DATABASE_URL="file:./dev.db"
AUTH_SECRET="<at least 32 characters>"
UPLOAD_DIR="./uploads"
MAX_UPLOAD_MB="200"
SESSION_TTL_DAYS="7"
```

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Apply migrations — this creates `prisma/dev.db` and generates the Prisma client:

```bash
npx prisma migrate dev
```

Start the dev server and open http://localhost:3000:

```bash
npm run dev
```

## Environment variables

All five are required; the app fails at startup if any is missing or invalid.

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Prisma SQLite connection string, e.g. `file:./dev.db` |
| `AUTH_SECRET` | HMAC secret for session JWTs, at least 32 characters |
| `UPLOAD_DIR` | Directory for videos, posters and profile images |
| `MAX_UPLOAD_MB` | Maximum video file size in megabytes |
| `SESSION_TTL_DAYS` | Session lifetime in days |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npx prisma migrate dev` | Apply migrations and generate the client (development) |
| `npx prisma migrate deploy` | Apply pending migrations (production) |
| `npx prisma studio` | Browse the database |

## Project structure

```text
prisma/                 schema, migrations, SQLite database
src/
  app/                  App Router pages and API route handlers
  components/           UI components grouped by feature
  application/          services, DTOs, mappers, Zod schemas
  domain/               entities, value objects, errors, ports
  infrastructure/       Prisma repositories, local storage, JWT/bcrypt, HTTP helpers
  hooks/                client-side data hooks
  lib/                  composition root, i18n, formatting, API client
  proxy.ts              auth guard for private pages
uploads/                local media (gitignored)
```

## Architecture

The code follows a layered structure with dependencies pointing inward:

- `domain` holds entities, value objects (`VideoVisibility`, `VideoCategory`), typed errors and repository ports. It has no framework or database imports.
- `application` contains use cases: `AuthService`, `VideoService`, `StudioService`, `CommentService`, `PlaylistService` and the rest. Services accept ports, validate input with Zod and return DTOs.
- `infrastructure` implements the ports: Prisma repositories, local file storage, JWT and bcrypt adapters, range parsing, rate limiting and HTTP response helpers.
- `app` is the delivery layer. Pages render server components and call services directly; route handlers stay thin — authenticate, parse, call one service, return JSON.

`src/lib/container.ts` is the only place where concrete implementations are wired to services. Everything else depends on interfaces from `src/domain/ports`, so storage or persistence can be replaced without touching use cases.

Route handlers are wrapped in `withApi`, which maps domain errors to HTTP responses through `ErrorMapper`: `ValidationError` → 400, `UnauthorizedError` → 401, `ForbiddenError` → 403, `NotFoundError` → 404, `ConflictError` → 409, `PayloadTooLargeError` → 413, `UnsupportedMediaTypeError` → 415, `RateLimitError` → 429, anything unexpected → 500.

## API

All endpoints return JSON. Errors have the shape `{ "error": "message", "code": "CODE" }`, and rate-limited responses add `retryAfterSec`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account and start a session |
| `POST` | `/api/auth/login` | Sign in |
| `POST` | `/api/auth/logout` | Clear the session cookie |
| `GET` | `/api/auth/me` | Current user |
| `GET` | `/api/videos` | Feed with `q`, `tag`, `category`, `sort`, `cursor` |
| `POST` | `/api/videos` | Upload a video (multipart) |
| `PATCH` | `/api/videos/:id` | Update metadata (owner only) |
| `DELETE` | `/api/videos/:id` | Delete a video (owner only) |
| `POST` | `/api/videos/:id/like` | Toggle a like |
| `POST` | `/api/videos/:id/view` | Register a view |
| `POST` | `/api/videos/:id/history` | Save playback position |
| `POST` | `/api/videos/:id/thumb` | Upload a poster |
| `GET` | `/api/videos/:id/comments` | Comment page |
| `POST` | `/api/videos/:id/comments` | Add a comment |
| `PATCH` | `/api/comments/:id` | Edit a comment |
| `DELETE` | `/api/comments/:id` | Delete a comment |
| `POST` | `/api/comments/:id/like` | Toggle a comment like |
| `GET` | `/api/comments/:id/replies` | Replies to a comment |
| `POST` | `/api/subscriptions` | Toggle a subscription |
| `GET` | `/api/playlists` | Playlists of the current user |
| `POST` | `/api/playlists` | Create a playlist |
| `GET` | `/api/playlists/:id` | Playlist with items |
| `PATCH` | `/api/playlists/:id` | Update a playlist |
| `DELETE` | `/api/playlists/:id` | Delete a playlist |
| `POST` | `/api/playlists/:id/items` | Add a video |
| `DELETE` | `/api/playlists/:id/items` | Remove a video |
| `POST` | `/api/playlists/:id/reorder` | Reorder items |
| `POST` | `/api/watch-later` | Toggle Watch Later |
| `DELETE` | `/api/history` | Clear watch history |
| `DELETE` | `/api/history/:videoId` | Remove one history entry |
| `POST` | `/api/notifications` | Mark all notifications read |
| `DELETE` | `/api/notifications/:id` | Delete a notification |
| `PATCH` | `/api/settings/profile` | Update profile |
| `POST` | `/api/settings/password` | Change password |
| `POST`/`DELETE` | `/api/settings/avatar` | Set or remove avatar |
| `POST`/`DELETE` | `/api/settings/banner` | Set or remove banner |
| `DELETE` | `/api/settings/account` | Delete the account |
| `GET` | `/api/media/:id` | Video stream with `Range` support |
| `GET` | `/api/thumb/:id` | Video poster |
| `GET` | `/api/avatar/:handle` | Channel avatar |
| `GET` | `/api/banner/:handle` | Channel banner |

Paginated responses use `{ items, nextCursor }`. The cursor is an offset encoded as a string; pass it back as `cursor` to load the next page.

## Data model

Defined in `prisma/schema.prisma`:

- `User` — account, channel profile and credentials
- `Video` — metadata, file name, visibility, counter cache
- `Like`, `CommentLike` — unique per user and target
- `Comment` — threaded via `parentId`
- `ViewEvent` — per-view timestamps used for daily analytics
- `Subscription` — subscriber → channel
- `Playlist` and `PlaylistItem` — custom playlists and the system Watch Later list
- `WatchHistory` — playback position per user and video
- `Notification` — new video and comment reply events

## Media and storage

Videos, posters and profile images are stored on disk under `UPLOAD_DIR`:

```text
$UPLOAD_DIR/
  <video-id>.mp4|webm
  thumbs/<video-id>.jpg
  images/avatar-<user-id>.jpg
  images/banner-<user-id>.jpg
```

Files are never served statically. All media goes through API routes that check visibility first, so private videos and their posters stay unreachable for other users. Video streaming honors `Range` requests and responds with `206 Partial Content`, which allows seeking and playback without downloading the whole file.

## Security

- Passwords are hashed with bcrypt; sessions are HS256 JWTs stored in an `httpOnly`, `sameSite=lax` cookie (`secure` in production)
- Private pages are guarded by `src/proxy.ts` (the Next.js 16 replacement for middleware)
- Every service re-checks ownership and video visibility; private videos, playlists and posters return 404 to outsiders
- File names are validated against a strict whitelist and resolved paths are checked to stay inside the upload root
- Uploads are limited by declared `Content-Length`, actual file size and MIME type; images must be JPEG up to 5 MB
- In-memory rate limits: login 10/min per IP, registration 10 per 10 minutes per IP, views 60/min per IP, comments 20/min per user and IP
- Security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`) are set in `next.config.ts`

## Internationalization and theming

The UI is localized in Russian and English. The locale lives in the `uatube_locale` cookie and is resolved on the server, so the first paint is already in the right language. The theme (`system`, `light`, `dark`) is stored in `uatube_theme` and applied via `data-theme` on `<html>`.

## Production notes

```bash
npx prisma migrate deploy
npm run build
npm start
```

- Persist both the SQLite database and `UPLOAD_DIR`; the app keeps no state anywhere else
- Use a unique `AUTH_SECRET` and serve over HTTPS so the session cookie is sent as `secure`
- Raise the reverse proxy body limit above `MAX_UPLOAD_MB`, otherwise large uploads fail before reaching the app
- Rate limiting is in-process: with multiple instances each one keeps its own counters
- Local storage assumes a single instance or a shared volume; swap the storage adapters for object storage if you need more

## Limitations

- Videos are served as uploaded — there is no transcoding, so playback depends on the browser supporting the codec inside the MP4/WebM container
- Posters are uploaded, not generated from video frames
- No email verification, password reset or OAuth providers
- No automated test suite
