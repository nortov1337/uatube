Задача: с нуля сделать MVP видеохостинга "UaTube" в E:\Soft\dev\web\UaTube (папка пустая).
Next.js (App Router) + TypeScript + Tailwind, SQLite + Prisma, видео файлами на диске.
Никаких мок-данных, сидов, фейковых видео/юзеров: БД стартует пустой, всё наполняется реальной
регистрацией и реальной загрузкой файлов.

ГЛАВНОЕ ТРЕБОВАНИЕ К КОДУ: строгая слоистая ООП-архитектура, логика разложена по маленьким файлам.
Один класс/один сервис — один файл. Файл > 200 строк — сигнал, что его надо делить. Никаких
"god-файлов" на 800 строк, никаких хелперов-свалок, никакой бизнес-логики в route.ts и в JSX.

Окружение: Windows, Node 24, npm 11, git. Работать в E:\Soft\dev\web\UaTube.

== 0. СЛОИ И ПРАВИЛА ИМПОРТОВ ==
Зависимости строго в одну сторону:  domain  <-  application  <-  infrastructure  <-  app
- domain: сущности, ошибки, интерфейсы-порты. Не импортирует НИЧЕГО из проекта и ничего из next/react/prisma.
- application: сервисы (use cases), DTO, zod-схемы. Импортирует только domain.
- infrastructure: реализации портов (Prisma, fs, bcrypt, jose, cookies). Импортирует domain.
- app (страницы/route handlers) и components: импортируют application-сервисы ТОЛЬКО через
  composition root src/lib/container.ts, плюс DTO-типы. Prisma и fs в app не импортируются никогда.
- Обратных импортов нет. Barrel-файлов (index.ts) нет — только явные пути.

== 1. ИНИЦИАЛИЗАЦИЯ ==
- npx create-next-app@latest . --ts --tailwind --app --src-dir --eslint --import-alias "@/*"
- npm i @prisma/client bcryptjs jose zod lucide-react ; npm i -D prisma @types/bcryptjs
- .env: DATABASE_URL="file:./dev.db" / AUTH_SECRET=<32+ случайных байт> / UPLOAD_DIR="./uploads" /
  MAX_UPLOAD_MB="200" / SESSION_TTL_DAYS="7". Никаких фолбэков секрета в коде.
- .gitignore: dev.db*, uploads/, .env
- git init, первый коммит после зелёного npm run build.

== 2. ПОЛНОЕ ДЕРЕВО ФАЙЛОВ (с назначением) ==
prisma/schema.prisma                     схема БД
uploads/.gitkeep                         папка медиа (создаётся в рантайме, если нет)

src/domain/errors/AppError.ts            abstract class AppError extends Error {code; httpStatus}
src/domain/errors/ValidationError.ts     400
src/domain/errors/UnauthorizedError.ts   401
src/domain/errors/ForbiddenError.ts      403
src/domain/errors/NotFoundError.ts       404
src/domain/errors/ConflictError.ts       409
src/domain/errors/PayloadTooLargeError.ts 413
src/domain/errors/UnsupportedMediaTypeError.ts 415
src/domain/errors/RateLimitError.ts      429 (несёт retryAfterSec)

src/domain/entities/UserEntity.ts        readonly id,email,handle,name,passwordHash,createdAt
src/domain/entities/VideoEntity.ts       readonly id,title,description,fileName,mimeType,sizeBytes,
                                         durationSec,thumbName,views,createdAt,authorId
src/domain/entities/VideoWithAuthor.ts   VideoEntity + author: UserEntity + likesCount: number
src/domain/entities/CommentEntity.ts     id,body,createdAt,userId,videoId + author
src/domain/entities/ChannelStats.ts      videos,views,likes

src/domain/ports/UserRepository.ts       interface
src/domain/ports/VideoRepository.ts      interface
src/domain/ports/LikeRepository.ts       interface
src/domain/ports/CommentRepository.ts    interface
src/domain/ports/PasswordHasher.ts       interface
src/domain/ports/TokenService.ts         interface
src/domain/ports/SessionCookie.ts        interface
src/domain/ports/VideoStorage.ts         interface
src/domain/ports/ThumbStorage.ts         interface
src/domain/ports/RateLimiter.ts          interface

src/application/dto/PublicUserDTO.ts     {id,handle,name}
src/application/dto/VideoCardDTO.ts      {id,title,thumbUrl,durationSec,views,createdAt,author,likesCount}
src/application/dto/VideoDetailsDTO.ts   VideoCardDTO + description,mimeType,sizeBytes,likedByMe
src/application/dto/CommentDTO.ts        {id,body,createdAt,author}
src/application/dto/ChannelDTO.ts        {handle,name,createdAt,stats}
src/application/dto/Page.ts              generic {items:T[]; nextCursor:string|null}
src/application/dto/SessionDTO.ts        {userId}

src/application/mappers/UserMapper.ts    toPublic(user) -> PublicUserDTO
src/application/mappers/VideoMapper.ts   toCard(v) / toDetails(v, likedByMe)
src/application/mappers/CommentMapper.ts toDTO(comment)

src/application/validation/schemas.ts    zod: registerSchema, loginSchema, commentSchema,
                                         videoMetaSchema, listQuerySchema
src/application/validation/parse.ts      parseOrThrow(schema, input) -> T (кидает ValidationError)

src/application/services/AuthService.ts       register/login/resolveSession
src/application/services/VideoService.ts      listFeed/getDetails/create/remove/registerView
src/application/services/LikeService.ts       toggle
src/application/services/CommentService.ts    list/create/remove
src/application/services/ChannelService.ts    getByHandle
src/application/services/MediaStreamService.ts openVideo(rangeHeader)/openThumb
src/application/services/UploadPolicy.ts      проверка mime/размера/названия, resolveExtension
src/application/services/HandleFactory.ts     email -> уникальный handle

src/infrastructure/db/prisma.ts                    singleton PrismaClient (globalThis кэш в dev)
src/infrastructure/repositories/PrismaUserRepository.ts
src/infrastructure/repositories/PrismaVideoRepository.ts
src/infrastructure/repositories/PrismaLikeRepository.ts
src/infrastructure/repositories/PrismaCommentRepository.ts
src/infrastructure/repositories/mappers/PrismaUserMapper.ts
src/infrastructure/repositories/mappers/PrismaVideoMapper.ts
src/infrastructure/repositories/mappers/PrismaCommentMapper.ts
src/infrastructure/security/BcryptPasswordHasher.ts
src/infrastructure/security/JoseTokenService.ts
src/infrastructure/http/CookieSessionStore.ts       implements SessionCookie (next/headers cookies())
src/infrastructure/storage/LocalFilePaths.ts        безопасные пути: uploads/<id>.<ext>, uploads/thumbs/<id>.jpg
src/infrastructure/storage/LocalVideoStorage.ts     implements VideoStorage
src/infrastructure/storage/LocalThumbStorage.ts     implements ThumbStorage
src/infrastructure/http/RangeParser.ts              parseRange(header,size) -> {start,end}|null|"invalid"
src/infrastructure/rate-limit/MemoryRateLimiter.ts  Map + окно, чистка по таймеру
src/infrastructure/http/ErrorMapper.ts              AppError -> {status,body}
src/infrastructure/http/JsonResponder.ts            ok()/created()/noContent()/error()

src/lib/container.ts                    composition root: собирает репозитории/адаптеры/сервисы один раз
src/lib/http/withApi.ts                 обёртка route handler: try/catch + ErrorMapper
src/lib/http/currentUserId.ts           getCurrentUserId(): Promise<string|null> через AuthService
src/lib/http/clientIp.ts                IP из x-forwarded-for для rate limit
src/lib/format.ts                       formatViews/formatDuration/timeAgo/formatBytes
src/lib/api-client.ts                   типизированные клиентские вызовы: postJson, uploadWithProgress

src/middleware.ts                       edge-guard: без сессии /upload -> /login?next=...

src/app/layout.tsx                      html/body, шрифт, <Header/>
src/app/globals.css                     tailwind + line-clamp утилиты
src/app/page.tsx                        лента (server)
src/app/loading.tsx                     скелетон ленты
src/app/watch/[id]/page.tsx             страница просмотра (server)
src/app/watch/[id]/loading.tsx
src/app/upload/page.tsx                 страница загрузки (server-обёртка)
src/app/channel/[handle]/page.tsx       канал (server)
src/app/login/page.tsx                  логин (server-обёртка)
src/app/register/page.tsx               регистрация
src/app/not-found.tsx                   404

src/app/api/auth/register/route.ts
src/app/api/auth/login/route.ts
src/app/api/auth/logout/route.ts
src/app/api/auth/me/route.ts
src/app/api/videos/route.ts             GET список / POST загрузка
src/app/api/videos/[id]/route.ts        DELETE
src/app/api/videos/[id]/view/route.ts   POST
src/app/api/videos/[id]/like/route.ts   POST toggle
src/app/api/videos/[id]/comments/route.ts GET/POST
src/app/api/comments/[id]/route.ts      DELETE
src/app/api/media/[id]/route.ts         GET стрим с Range
src/app/api/thumb/[id]/route.ts         GET постер

src/components/layout/Header.tsx        server: логотип, поиск, кнопки, текущий юзер
src/components/layout/UserMenu.tsx      client: меню аватара + выход
src/components/layout/SearchBar.tsx     client: GET /?q=, раскрытие на мобиле
src/components/layout/Logo.tsx
src/components/video/VideoCard.tsx
src/components/video/VideoGrid.tsx      сетка + пустой стейт
src/components/video/VideoPlayer.tsx    client: <video> + регистрация просмотра
src/components/video/VideoMeta.tsx      title, счётчики, дата
src/components/video/VideoDescription.tsx client: line-clamp + "ещё"
src/components/video/RelatedList.tsx
src/components/video/LikeButton.tsx     client: оптимистичный toggle
src/components/video/OwnerActions.tsx   client: удаление видео автором
src/components/comments/CommentsSection.tsx  client: оркестратор (загрузка/добавление/удаление)
src/components/comments/CommentForm.tsx
src/components/comments/CommentItem.tsx
src/components/comments/CommentSkeleton.tsx
src/components/upload/UploadForm.tsx    client: файл, превью, прогресс, submit
src/components/upload/DropZone.tsx
src/components/upload/UploadPreview.tsx постер + длительность + размер
src/components/auth/LoginForm.tsx
src/components/auth/RegisterForm.tsx
src/components/auth/FieldError.tsx
src/components/ui/Avatar.tsx            кружок с инициалом (цвет из хеша handle)
src/components/ui/Button.tsx            варианты primary/secondary/ghost, размеры
src/components/ui/Input.tsx
src/components/ui/Textarea.tsx
src/components/ui/Spinner.tsx
src/components/ui/EmptyState.tsx        иконка + текст + опциональная кнопка
src/components/ui/Thumb.tsx             постер или градиент-плейсхолдер с инициалом

src/hooks/useVideoMetadata.ts           клиент: duration + canvas-кадр из выбранного файла
src/hooks/useLike.ts                    клиент: состояние лайка + вызов API
src/hooks/useComments.ts                клиент: список, пагинация, add/remove
src/hooks/useUploadForm.ts              клиент: состояние формы + XHR прогресс
src/hooks/useMounted.ts                 (только если реально нужен — иначе не создавать)

== 3. DOMAIN (контракты, точные сигнатуры) ==
AppError:
  abstract class AppError extends Error {
    abstract readonly code: string; abstract readonly httpStatus: number;
    constructor(message: string) { super(message); this.name = new.target.name }
  }
Все наследники: readonly code = "VALIDATION" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" |
"CONFLICT" | "PAYLOAD_TOO_LARGE" | "UNSUPPORTED_MEDIA" | "RATE_LIMIT", httpStatus по таблице.
RateLimitError дополнительно: constructor(message, readonly retryAfterSec: number).

UserRepository:
  findById(id: string): Promise<UserEntity | null>
  findByEmail(email: string): Promise<UserEntity | null>
  findByHandle(handle: string): Promise<UserEntity | null>
  handleExists(handle: string): Promise<boolean>
  create(data: { email: string; handle: string; name: string; passwordHash: string }): Promise<UserEntity>

VideoRepository:
  create(data: NewVideoData): Promise<VideoEntity>          // NewVideoData = Omit<VideoEntity,"id"|"views"|"createdAt">
  findById(id: string): Promise<VideoWithAuthor | null>
  remove(id: string): Promise<void>
  incrementViews(id: string): Promise<number>                // возвращает новое значение
  listFeed(p: { q?: string; authorId?: string; excludeId?: string; cursor?: string; limit: number }):
      Promise<{ items: VideoWithAuthor[]; nextCursor: string | null }>
  listRelated(p: { video: VideoWithAuthor; limit: number }): Promise<VideoWithAuthor[]>
  statsByAuthor(authorId: string): Promise<ChannelStats>

LikeRepository:
  find(userId: string, videoId: string): Promise<boolean>
  toggle(userId: string, videoId: string): Promise<boolean>   // true = теперь лайк стоит
  countByVideo(videoId: string): Promise<number>

CommentRepository:
  list(p: { videoId: string; cursor?: string; limit: number }): Promise<{ items: CommentEntity[]; nextCursor: string | null }>
  countByVideo(videoId: string): Promise<number>
  create(data: { body: string; userId: string; videoId: string }): Promise<CommentEntity>
  findById(id: string): Promise<CommentEntity | null>
  remove(id: string): Promise<void>

PasswordHasher: hash(plain: string): Promise<string> / verify(plain: string, hash: string): Promise<boolean>
TokenService:  sign(payload: { sub: string }): Promise<string> / verify(token: string): Promise<{ sub: string } | null>
SessionCookie: get(): Promise<string | undefined> / set(token: string, maxAgeSec: number): Promise<void> / clear(): Promise<void>
VideoStorage:  save(videoId: string, mime: string, data: Uint8Array): Promise<string /*fileName*/>
               remove(fileName: string): Promise<void>
               open(fileName: string, range: {start:number;end:number} | null): Promise<{stream: ReadableStream; size: number}>
               size(fileName: string): Promise<number | null>
ThumbStorage:  save(videoId: string, jpeg: Uint8Array): Promise<string /*thumbName*/>
               remove(thumbName: string): Promise<void>
               path(thumbName: string): string
RateLimiter:   consume(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterSec: number }

== 4. APPLICATION (сервисы: конструктор-инъекция, без статики) ==
Все сервисы принимают зависимости через constructor(private readonly deps: {...}) и не знают про Next.
Все публичные методы кидают доменные ошибки, а не коды HTTP.

AuthService(deps: {users, hasher, tokens, cookie, handles})
  async register(input: unknown): Promise<PublicUserDTO>
    parseOrThrow(registerSchema) -> нормализовать email (trim+lowercase) -> findByEmail -> ConflictError
    -> handle = handles.fromEmail(email) (проверка уникальности через users.handleExists, суффикс -2,-3)
    -> passwordHash = hasher.hash -> users.create -> tokens.sign -> cookie.set(ttl из env) -> UserMapper.toPublic
  async login(input: unknown): Promise<PublicUserDTO>   // 401 одинаковый текст для "нет юзера" и "плохой пароль"
  async resolveSession(): Promise<{ userId: string } | null>  // cookie.get -> tokens.verify -> null при мусоре
  async logout(): Promise<void>                          // cookie.clear

VideoService(deps: {videos, likes, storage, thumbs, policy, now?})
  async listFeed(query: unknown): Promise<Page<VideoCardDTO>>
  async getDetails(id: string, viewerId: string | null): Promise<VideoDetailsDTO>  // NotFoundError, likedByMe
  async create(input: { userId: string; file: File; title: unknown; description: unknown; durationSec: unknown }): Promise<{ id: string }>
    порядок: policy.assertValid(file, title) -> videos.create(meta c fileName-заглушкой) невозможен,
    поэтому: 1) сгенерировать videoId (crypto.randomUUID) 2) storage.save(videoId, mime, bytes) 3) thumb (если передан)
     -> thumbs.save 4) videos.create с готовыми fileName/thumbName. Если шаг 4 упал — удалить файлы и пробросить ошибку.
  async remove(id: string, userId: string): Promise<void>   // NotFoundError / ForbiddenError, затем storage.remove + thumbs.remove + videos.remove
  async registerView(id: string): Promise<{ views: number }> // NotFoundError, videos.incrementViews

LikeService(deps: {likes, videos})
  async toggle(videoId: string, userId: string): Promise<{ liked: boolean; likes: number }>  // видео должно существовать

CommentService(deps: {comments, videos})
  async list(videoId: string, query: unknown): Promise<Page<CommentDTO>>
  async create(videoId: string, userId: string, input: unknown): Promise<CommentDTO>  // body trim, 1..1000
  async remove(commentId: string, userId: string): Promise<void>
    // разрешено автору комментария ИЛИ автору видео; иначе ForbiddenError

ChannelService(deps: {users, videos})
  async getByHandle(handle: string): Promise<{ channel: ChannelDTO; videos: Page<VideoCardDTO> }>  // NotFoundError

MediaStreamService(deps: {videos, storage, thumbs})
  async openVideo(id: string, rangeHeader: string | null): Promise<
      { stream: ReadableStream; size: number; start: number; end: number; partial: boolean; mimeType: string }>
    // NotFoundError если записи/файла нет; RangeParser + storage.open
  async openThumb(id: string): Promise<{ path: string } | null>

UploadPolicy(deps: {maxBytes: number})
  assertValid(file: File, title: string): void   // mime только video/mp4|video/webm; size<=maxBytes -> PayloadTooLargeError;
                                                 // size>0; title 1..120 после trim; иначе UnsupportedMediaType/Validation
  extensionFor(mime: string): "mp4" | "webm"
  assertContentLength(header: string | null): void  // ранний 413 до чтения body

HandleFactory(deps: {users})
  async fromEmail(email: string): Promise<string>  // транслит/латиница, [a-z0-9_], 3..20, при занятости суффикс

DTO-мапперы — единственное место, где решается, что уходит на клиент. passwordHash наружу не попадает никогда.

== 5. INFRASTRUCTURE (детали реализации) ==
prisma.ts: export const prisma = globalThis.__prisma ?? new PrismaClient(); в dev кэшировать в globalThis.
Prisma-репозитории: только запросы + маппинг в доменные сущности через mappers/Prisma*Mapper.
  - listFeed: orderBy [{createdAt:"desc"},{id:"desc"}], take limit+1 (для nextCursor), cursor по id с skip:1,
    where: q ? { title: { contains: q } } : {}, authorId, NOT: {id: excludeId}, include: { author:true, _count:{select:{likes:true}} }.
  - listRelated: сначала authorId = video.authorId (кроме текущего), добить свежими до limit.
  - statsByAuthor: count видео + aggregate _sum(views) + count лайков через Like where video.authorId.
LocalFilePaths: root = resolve(process.env.UPLOAD_DIR); thumbs = join(root,"thumbs"); имя файла только
  `<uuid>.<ext>` из whitelisted расширений; перед любой записью/чтением ensureInside(root, path) — защита от traversal.
LocalVideoStorage: mkdir recursive; writeFile; open() -> fs.createReadStream(path,{start,end}) -> Readable.toWeb(...)
  as ReadableStream; size() -> stat, ENOENT -> null; remove() -> rm force.
LocalThumbStorage: то же для jpg + path() для отдачи через route.
BcryptPasswordHasher: cost 10.
JoseTokenService: HS256, exp = SESSION_TTL_DAYS, secret из env (кинуть при старте, если пусто), verify ловит ошибку -> null.
CookieSessionStore: cookies() из next/headers, name "session", httpOnly, sameSite "lax", secure = NODE_ENV==="production",
  path "/", maxAge из параметра. Все методы async.
RangeParser: parseRange(header, size): null | "invalid" | {start,end}  // "bytes=0-1023", "bytes=100-", суффикс "bytes=-500"
MemoryRateLimiter: Map<string, number[]>; consume() чистит старые метки, сравнивает с limit; периодический
  setInterval(...).unref() для чистки (или чистка на каждом вызове — без таймеров).
ErrorMapper: toResponse(error): {status, body} — AppError -> свой status/code/message; ZodError -> 400; иначе 500
  {code:"INTERNAL", message:"Внутренняя ошибка"} и console.error(error) только в этом месте.

== 6. COMPOSITION ROOT И HTTP-СЛОЙ ==
container.ts собирает один раз (module-level singleton):
  const users = new PrismaUserRepository(prisma) ... const videos = new PrismaVideoRepository(prisma) ...
  const storage = new LocalVideoStorage(new LocalFilePaths()) ... export const container = { auth, videos, likes,
  comments, channels, media, sessions }
Никакой другой файл не делает new сервис/репозиторий.
withApi(handler): (req, ctx) => { try { return await handler(req, ctx) } catch (e) { const {status,body} = ErrorMapper.toResponse(e);
  return NextResponse.json(body, {status}) } }
currentUserId(): const session = await container.auth.resolveSession(); return session?.userId ?? null
clientIp(req): x-forwarded-for.split(",")[0] || x-real-ip || "local"

Route handlers — тонкие (5-15 строк): взять userId -> вызвать сервис -> вернуть JSON. Без SQL, без fs, без условий бизнес-логики.
  POST /api/auth/register   withApi: container.auth.register(await req.json()) -> 201
  POST /api/auth/login      -> 200 PublicUserDTO
  POST /api/auth/logout     -> 204
  GET  /api/auth/me         -> {user: PublicUserDTO|null}
  GET  /api/videos          -> container.videos.listFeed(Object.fromEntries(searchParams))
  POST /api/videos          Content-Length > лимита -> 413 сразу; formData() -> file/title/description/durationSec/thumb
                            -> container.videos.create({userId, ...}) -> 201 {id}
  DELETE /api/videos/[id]   userId обязателен, иначе UnauthorizedError -> 204
  POST /api/videos/[id]/view -> 200 {views}
  POST /api/videos/[id]/like -> 200 {liked, likes} (auth)
  GET/POST /api/videos/[id]/comments (POST — auth, rate limit 20/мин по IP+userId)
  DELETE /api/comments/[id]  (auth) -> 204
  GET /api/media/[id]       runtime="nodejs", dynamic="force-dynamic"; headers Accept-Ranges: bytes, Content-Type,
                            Content-Length; partial -> 206 + Content-Range: bytes start-end/size; body = stream
  GET /api/thumb/[id]       runtime="nodejs"; readFile -> Response с image/jpeg, Cache-Control public,max-age=31536000,immutable
  Rate limit на login: 10/мин по IP -> RateLimitError(429).

== 7. UI: КОМПОНЕНТЫ (пропсы и границы) ==
Правило: серверные компоненты (страницы) берут данные из container и передают ТОЛЬКО DTO. Клиентские компоненты
помечены "use client", получают колбэки/начальные данные пропсами и не знают про Prisma/сервисы.
Любой компонент > 120 строк — делить.

Header (server): получает currentUser: PublicUserDTO|null через container.auth.resolveSession + users.findById;
  разметка sticky top-0 z-40 h-14, grid: логотип | поиск | действия. <md: поиск — иконка, открывает строку под хедером.
SearchBar (client): <form action="/" method="get"> с input name="q", defaultValue из пропса.
UserMenu (client): Avatar + dropdown (Мой канал, Выйти через POST /api/auth/logout + router.refresh()).
VideoCard: Link на /watch/[id]; Thumb 16:9; бейдж formatDuration; title line-clamp-2; Avatar + name + @handle;
  "N просмотров · timeAgo".
VideoGrid: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8; если пусто — EmptyState.
VideoPlayer (client): <video controls playsInline preload="metadata" poster="/api/thumb/[id]"> src=`/api/media/[id]`;
  useEffect: если sessionStorage["viewed:"+id] нет -> POST /view -> setItem -> обновить счётчик через пропс-колбэк.
LikeButton (client): useLike; иконка ThumbsUp (заполненная при liked), счётчик; гость -> router.push(`/login?next=...`).
OwnerActions (client): кнопка "Удалить" (только автор), confirm() -> DELETE -> router.push("/") + router.refresh().
CommentsSection (client): useComments(initial, videoId); форма только для залогиненных, иначе текст + ссылка на /login.
CommentItem: Avatar, name, timeAgo, body (whitespace-pre-wrap break-words), кнопка удаления если canDelete.
UploadForm (client): useUploadForm + DropZone + UploadPreview; поля title (обязательно), description; кнопка disabled
  пока нет файла/идёт отправка; прогресс-бар по xhr.upload.onprogress; ошибки из {error} ответа.
DropZone: drag-over подсветка, input type=file accept="video/mp4,video/webm".
useVideoMetadata: on file -> objectURL -> video metadata -> {durationSec, thumbBlob} (canvas 640x360, seek на min(1,duration/2)).
useUploadForm: FormData(file,title,description,durationSec,thumb) -> uploadWithProgress(url, formData, onProgress).
api-client: requestJson<T>(url, init) с разбором {error}; uploadWithProgress(url, formData, onProgress): Promise<T> на XHR.

== 8. СТРАНИЦЫ ==
/ (лента): container.videos.listFeed({q, limit:24}) -> <VideoGrid/>; если q — заголовок "Результаты по «q»".
/watch/[id]: parallel в серверном компоненте: getDetails + comments.list(limit 20) + videos.listRelated;
  layout: lg:grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6; сайдбар на <lg уходит под комментарии.
  Несуществующий id -> notFound().
/upload: если нет сессии (middleware уже отсёк) — просто <UploadForm/> в max-w-2xl.
/channel/[handle]: ChannelService -> шапка (Avatar, name, @handle, "на сайте с <месяц год>", счётчики) + VideoGrid.
/login, /register: max-w-sm карточка, LoginForm/RegisterForm, ?next= -> router.replace(next || "/").
not-found.tsx: EmptyState + ссылка на главную.
loading.tsx: серые блоки той же сетки.

== 9. UX / АДАПТИВНОСТЬ / МЕЛОЧИ ==
- Mobile-first. Брейкпоинты Tailwind: sm 640, md 768, lg 1024, xl 1280. Горизонтального скролла нет на 320px.
- Тач-таргеты >= 40px, у иконочных кнопок aria-label.
- Тёмная тема не нужна; светлая, нейтральные серые, акцент — red-600.
- formatViews: 999 -> "999", 1234 -> "1,2 тыс.", 1_200_000 -> "1,2 млн".
- timeAgo: Intl.RelativeTimeFormat("ru", {numeric:"auto"}) с шагами сек/мин/час/день/неделя/месяц/год.
- formatDuration: 65 -> "1:05", 3725 -> "1:02:05". formatBytes: "48,3 МБ".
- Пустые состояния реальные и с CTA; ошибки сети — текст под формой, без alert().
- Никаких console.log в коде (кроме console.error в ErrorMapper).

== 10. ПОРЯДОК РАБОТЫ (по шагам, каждый шаг коммитится) ==
1. Scaffold, env, .gitignore, deps.
2. prisma/schema.prisma + migrate dev --name init.
3. domain: ошибки -> сущности -> порты (компилируется без app).
4. infrastructure: prisma, mappers, репозитории, storage, security, http-утилиты, rate limiter.
5. application: dto, mappers, validation, UploadPolicy, HandleFactory, сервисы.
6. lib/container.ts + withApi + currentUserId.
7. API routes (все), проверить curl'ом регистрацию/логин/список.
8. UI-примитивы (ui/*), затем layout + auth-формы.
9. Лента, watch, upload, channel, 404/loading.
10. npm run build -> зелёный; ручной прогон сценария; финальный коммит.

== 11. КРИТЕРИИ ГОТОВНОСТИ ==
1. npm run build без ошибок типов; в проекте нет ни одного файла > 200 строк, ни одного any, ни одного мока.
2. Регистрация -> автологин -> лента; выход; повторный вход. Сессия жива после перезагрузки, cookie httpOnly.
3. Загрузка реального mp4 (10-50 МБ): прогресс, canvas-постер, длительность, редирект на /watch/[id];
   видео играет, перемотка работает (206 + Content-Range).
4. Просмотр инкрементится один раз за сессию браузера; лайк toggle переживает перезагрузку, счётчик верный.
5. Комментарий создаётся, переживает перезагрузку, удаляется автором; чужой удалить нельзя (403);
   гость видит приглашение войти.
6. Лента/поиск/канал/похожие берут данные только из БД; при удалении видео файлы с диска исчезают.
7. 375px: всё читаемо, ничего не вылезает; 1440px: лента 4 колонки, watch — контент + сайдбар.
8. Импорты не нарушают направление слоёв: grep по "prisma" и "@prisma/client" в src/app и src/components — пусто;
   grep по "fs" вне src/infrastructure — пусто.
Проверка: один прогон npm run build. Остальное пользователь смотрит сам.

== 12. ЗАПРЕТЫ ==
- Не добавлять: подписки, плейлисты, транскодинг, ffmpeg, WebSocket-чат, i18n, тесты, Docker, CI, storybook.
- Не делать barrel-файлы, не тащить UI-библиотеки, не писать комментарии в коде, не оставлять мёртвый код,
  не оборачивать всё в try/catch, не создавать файлы "helpers.ts/utils.ts" общего назначения.
- Не менять файлы вне E:\Soft\dev\web\UaTube.

== 13. СХЕМА ПРИЗМЫ (prisma/schema.prisma) ==
datasource sqlite + generator client.

model User {
  id String @id @default(cuid())
  email String @unique
  handle String @unique
  name String
  passwordHash String
  createdAt DateTime @default(now())
  videos Video[]
  likes Like[]
  comments Comment[]
}

model Video {
  id String @id @default(cuid())
  title String
  description String @default("")
  fileName String
  mimeType String
  sizeBytes Int
  durationSec Float @default(0)
  thumbName String?
  views Int @default(0)
  createdAt DateTime @default(now())
  authorId String
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)
  likes Like[]
  comments Comment[]
  @@index([createdAt])
  @@index([authorId])
}

model Like {
  id String @id @default(cuid())
  userId String
  videoId String
  createdAt DateTime @default(now())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  video Video @relation(fields: [videoId], references: [id], onDelete: Cascade)
  @@unique([userId, videoId])
}

model Comment {
  id String @id @default(cuid())
  body String
  userId String
  videoId String
  createdAt DateTime @default(now())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  video Video @relation(fields: [videoId], references: [id], onDelete: Cascade)
  @@index([videoId, createdAt])
}
