import { z } from "zod";

export const generateSchema = z.object({
  platform: z.enum(["FACEBOOK", "TIKTOK", "INSTAGRAM", "YOUTUBE_SHORTS"]),
  contentType: z.enum([
    "REEL_CAPTION",
    "VIRAL_HOOK",
    "HASHTAGS",
    "FIRST_COMMENT",
    "GIVEAWAY_POST",
    "STAR_SENDER_SHOUTOUT",
    "FUNNY_COUPLE_CAPTION",
    "INSPIRATIONAL_POST",
    "OFW_CONTENT",
    "NURSE_APPRECIATION",
    "REAL_ESTATE_CAPTION",
  ]),
  tone: z.enum([
    "FUNNY",
    "INSPIRATIONAL",
    "EMOTIONAL",
    "FRIENDLY",
    "PROFESSIONAL",
    "TAGALOG",
    "TAGLISH",
    "VIRAL",
  ]),
  length: z.enum(["SHORT", "MEDIUM", "LONG"]),
  topic: z.string().min(3).max(200),
  audience: z.string().max(200).optional(),
  extraDetails: z.string().max(500).optional(),
});

export const saveContentSchema = z.object({
  platform: z.enum(["FACEBOOK", "TIKTOK", "INSTAGRAM", "YOUTUBE_SHORTS"]),
  contentType: z.enum([
    "REEL_CAPTION",
    "VIRAL_HOOK",
    "HASHTAGS",
    "FIRST_COMMENT",
    "GIVEAWAY_POST",
    "STAR_SENDER_SHOUTOUT",
    "FUNNY_COUPLE_CAPTION",
    "INSPIRATIONAL_POST",
    "OFW_CONTENT",
    "NURSE_APPRECIATION",
    "REAL_ESTATE_CAPTION",
  ]),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  hashtags: z.string().max(1000).optional(),
  hook: z.string().max(500).optional(),
  firstComment: z.string().max(1000).optional(),
  cta: z.string().max(300).optional(),
});

export const updateContentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(5000).optional(),
  hashtags: z.string().max(1000).optional(),
  hook: z.string().max(500).optional(),
  firstComment: z.string().max(1000).optional(),
  cta: z.string().max(300).optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

