import { AuthService } from "@/application/services/AuthService";
import { ChannelService } from "@/application/services/ChannelService";
import { CommentService } from "@/application/services/CommentService";
import { HandleFactory } from "@/application/services/HandleFactory";
import { HistoryService } from "@/application/services/HistoryService";
import { ImagePolicy } from "@/application/services/ImagePolicy";
import { LikeService } from "@/application/services/LikeService";
import { MediaStreamService } from "@/application/services/MediaStreamService";
import { NotificationService } from "@/application/services/NotificationService";
import { PlaylistService } from "@/application/services/PlaylistService";
import { ProfileService } from "@/application/services/ProfileService";
import { RecommendationService } from "@/application/services/RecommendationService";
import { StudioService } from "@/application/services/StudioService";
import { SubscriptionService } from "@/application/services/SubscriptionService";
import { UploadPolicy } from "@/application/services/UploadPolicy";
import { VideoService } from "@/application/services/VideoService";
import { prisma } from "@/infrastructure/db/prisma";
import { CookieSessionStore } from "@/infrastructure/http/CookieSessionStore";
import { MemoryRateLimiter } from "@/infrastructure/rate-limit/MemoryRateLimiter";
import { PrismaCommentLikeRepository } from "@/infrastructure/repositories/PrismaCommentLikeRepository";
import { PrismaCommentRepository } from "@/infrastructure/repositories/PrismaCommentRepository";
import { PrismaHistoryRepository } from "@/infrastructure/repositories/PrismaHistoryRepository";
import { PrismaLikeRepository } from "@/infrastructure/repositories/PrismaLikeRepository";
import { PrismaNotificationRepository } from "@/infrastructure/repositories/PrismaNotificationRepository";
import { PrismaPlaylistRepository } from "@/infrastructure/repositories/PrismaPlaylistRepository";
import { PrismaSubscriptionRepository } from "@/infrastructure/repositories/PrismaSubscriptionRepository";
import { PrismaUserRepository } from "@/infrastructure/repositories/PrismaUserRepository";
import { PrismaVideoRepository } from "@/infrastructure/repositories/PrismaVideoRepository";
import { BcryptPasswordHasher } from "@/infrastructure/security/BcryptPasswordHasher";
import { JoseTokenService } from "@/infrastructure/security/JoseTokenService";
import { RandomVideoIdGenerator } from "@/infrastructure/security/RandomVideoIdGenerator";
import { LocalFilePaths } from "@/infrastructure/storage/LocalFilePaths";
import { LocalImageStorage } from "@/infrastructure/storage/LocalImageStorage";
import { LocalThumbStorage } from "@/infrastructure/storage/LocalThumbStorage";
import { LocalVideoStorage } from "@/infrastructure/storage/LocalVideoStorage";

const secret = process.env.AUTH_SECRET;
if (!secret) throw new Error("AUTH_SECRET не задан");

const users = new PrismaUserRepository(prisma);
const videos = new PrismaVideoRepository(prisma);
const likes = new PrismaLikeRepository(prisma);
const comments = new PrismaCommentRepository(prisma);
const commentLikes = new PrismaCommentLikeRepository(prisma);
const subscriptions = new PrismaSubscriptionRepository(prisma);
const playlists = new PrismaPlaylistRepository(prisma);
const history = new PrismaHistoryRepository(prisma);
const notifications = new PrismaNotificationRepository(prisma);

const paths = new LocalFilePaths();
const storage = new LocalVideoStorage(paths);
const thumbs = new LocalThumbStorage(paths);
const images = new LocalImageStorage(paths);
const hasher = new BcryptPasswordHasher();
const uploadPolicy = new UploadPolicy({
  maxBytes: Number(process.env.MAX_UPLOAD_MB) * 1024 * 1024,
});
const imagePolicy = new ImagePolicy();

const auth = new AuthService({
  users,
  hasher,
  tokens: new JoseTokenService({
    secret,
    ttlDays: Number(process.env.SESSION_TTL_DAYS),
  }),
  cookie: new CookieSessionStore(),
  handles: new HandleFactory({ users }),
});

const recommendations = new RecommendationService({ videos, subscriptions, history });
const playlistService = new PlaylistService({ playlists, videos });

export const container = {
  auth,
  videos: new VideoService({ videos, likes, recommendations }),
  studio: new StudioService({
    videos,
    storage,
    thumbs,
    policy: uploadPolicy,
    imagePolicy,
    ids: new RandomVideoIdGenerator(),
    subscriptions,
    notifications,
  }),
  likes: new LikeService({ likes, videos }),
  comments: new CommentService({ comments, commentLikes, videos, notifications }),
  channels: new ChannelService({ users, videos, subscriptions, playlists: playlistService }),
  media: new MediaStreamService({ videos, users, storage, thumbs, images }),
  subscriptions: new SubscriptionService({ subscriptions, users }),
  playlists: playlistService,
  history: new HistoryService({ history, videos }),
  notifications: new NotificationService({ notifications }),
  profile: new ProfileService({
    users,
    videos,
    hasher,
    images,
    imagePolicy,
    storage,
    thumbs,
  }),
  uploadPolicy,
  imagePolicy,
  rateLimiter: new MemoryRateLimiter(),
};
