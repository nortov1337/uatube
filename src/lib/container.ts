import { AuthService } from "@/application/services/AuthService";
import { ChannelService } from "@/application/services/ChannelService";
import { CommentService } from "@/application/services/CommentService";
import { HandleFactory } from "@/application/services/HandleFactory";
import { LikeService } from "@/application/services/LikeService";
import { MediaStreamService } from "@/application/services/MediaStreamService";
import { UploadPolicy } from "@/application/services/UploadPolicy";
import { VideoService } from "@/application/services/VideoService";
import { prisma } from "@/infrastructure/db/prisma";
import { CookieSessionStore } from "@/infrastructure/http/CookieSessionStore";
import { MemoryRateLimiter } from "@/infrastructure/rate-limit/MemoryRateLimiter";
import { PrismaCommentRepository } from "@/infrastructure/repositories/PrismaCommentRepository";
import { PrismaLikeRepository } from "@/infrastructure/repositories/PrismaLikeRepository";
import { PrismaUserRepository } from "@/infrastructure/repositories/PrismaUserRepository";
import { PrismaVideoRepository } from "@/infrastructure/repositories/PrismaVideoRepository";
import { BcryptPasswordHasher } from "@/infrastructure/security/BcryptPasswordHasher";
import { JoseTokenService } from "@/infrastructure/security/JoseTokenService";
import { LocalFilePaths } from "@/infrastructure/storage/LocalFilePaths";
import { LocalThumbStorage } from "@/infrastructure/storage/LocalThumbStorage";
import { LocalVideoStorage } from "@/infrastructure/storage/LocalVideoStorage";

const secret = process.env.AUTH_SECRET;
if (!secret) throw new Error("AUTH_SECRET не задан");

const users = new PrismaUserRepository(prisma);
const videos = new PrismaVideoRepository(prisma);
const likes = new PrismaLikeRepository(prisma);
const comments = new PrismaCommentRepository(prisma);

const paths = new LocalFilePaths();
const storage = new LocalVideoStorage(paths);
const thumbs = new LocalThumbStorage(paths);
const uploadPolicy = new UploadPolicy({
  maxBytes: Number(process.env.MAX_UPLOAD_MB) * 1024 * 1024,
});

const auth = new AuthService({
  users,
  hasher: new BcryptPasswordHasher(),
  tokens: new JoseTokenService({
    secret,
    ttlDays: Number(process.env.SESSION_TTL_DAYS),
  }),
  cookie: new CookieSessionStore(),
  handles: new HandleFactory({ users }),
});

export const container = {
  auth,
  videos: new VideoService({ videos, likes, storage, thumbs, policy: uploadPolicy }),
  likes: new LikeService({ likes, videos }),
  comments: new CommentService({ comments, videos }),
  channels: new ChannelService({ users, videos }),
  media: new MediaStreamService({ videos, storage, thumbs }),
  uploadPolicy,
  rateLimiter: new MemoryRateLimiter(),
};
