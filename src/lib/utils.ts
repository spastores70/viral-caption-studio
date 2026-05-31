import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getPlatformLabel(platform: string): string {
  const map: Record<string, string> = {
    FACEBOOK: "Facebook",
    TIKTOK: "TikTok",
    INSTAGRAM: "Instagram",
    YOUTUBE_SHORTS: "YouTube Shorts",
  };
  return map[platform] || platform;
}

export function getContentTypeLabel(contentType: string): string {
  const map: Record<string, string> = {
    REEL_CAPTION: "Reel Caption",
    VIRAL_HOOK: "Viral Hook",
    HASHTAGS: "Hashtags",
    FIRST_COMMENT: "First Comment",
    GIVEAWAY_POST: "Giveaway Post",
    STAR_SENDER_SHOUTOUT: "Star Sender Shoutout",
    FUNNY_COUPLE_CAPTION: "Funny Couple Caption",
    INSPIRATIONAL_POST: "Inspirational Post",
    OFW_CONTENT: "OFW Content",
    NURSE_APPRECIATION: "Nurse Appreciation",
    REAL_ESTATE_CAPTION: "Real Estate Caption",
  };
  return map[contentType] || contentType;
}

export function getToneLabel(tone: string): string {
  const map: Record<string, string> = {
    FUNNY: "Funny",
    INSPIRATIONAL: "Inspirational",
    EMOTIONAL: "Emotional",
    FRIENDLY: "Friendly",
    PROFESSIONAL: "Professional",
    TAGALOG: "Tagalog",
    TAGLISH: "Taglish",
    VIRAL: "Viral",
  };
  return map[tone] || tone;
}

