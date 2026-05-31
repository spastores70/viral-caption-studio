export const VIDEO_STYLES = {
  CINEMATIC: {
    label: "Cinematic",
    emoji: "🎬",
    description: "Dramatic lighting, film grain",
    promptSuffix:
      "cinematic quality, dramatic lighting, shallow depth of field, professional cinematography, smooth camera movement, film grain, movie-quality visuals",
    negativePrompt:
      "blurry, shaky, amateur, low quality, pixelated, distorted",
  },
  REALISTIC: {
    label: "Realistic",
    emoji: "📸",
    description: "Natural, photorealistic",
    promptSuffix:
      "photorealistic, natural movement, high detail, lifelike, 8K quality, smooth motion, physically accurate",
    negativePrompt:
      "cartoon, illustration, blurry, artificial, distorted, low quality",
  },
  CARTOON: {
    label: "Cartoon",
    emoji: "🎨",
    description: "Animated, vibrant",
    promptSuffix:
      "vibrant cartoon animation, bold colors, smooth 2D animation, clean lines, animated series quality, expressive characters",
    negativePrompt:
      "realistic, photographic, blurry, low quality, rough animation",
  },
  FANTASY: {
    label: "Fantasy",
    emoji: "✨",
    description: "Magical, ethereal",
    promptSuffix:
      "fantasy world, magical atmosphere, ethereal lighting, mystical effects, dreamlike quality, epic visuals, glowing particles",
    negativePrompt:
      "mundane, realistic, blurry, low quality, dark, gritty",
  },
  VIRAL_SOCIAL: {
    label: "Viral",
    emoji: "📱",
    description: "Eye-catching, trending",
    promptSuffix:
      "dynamic motion, eye-catching visuals, vibrant colors, trending social media aesthetic, fast-paced energy, satisfying movement",
    negativePrompt:
      "slow, boring, blurry, low quality, dull colors, static",
  },
} as const;

export const VIDEO_RATIOS = {
  PORTRAIT_9_16: {
    label: "9:16",
    description: "Reels / TikTok",
    emoji: "📲",
    falValue: "9:16",
    cssClass: "aspect-[9/16]",
  },
  LANDSCAPE_16_9: {
    label: "16:9",
    description: "YouTube / Wide",
    emoji: "🖥️",
    falValue: "16:9",
    cssClass: "aspect-video",
  },
  SQUARE_1_1: {
    label: "1:1",
    description: "Square / Feed",
    emoji: "⬜",
    falValue: "1:1",
    cssClass: "aspect-square",
  },
} as const;

export const VIDEO_DURATIONS = [
  { seconds: 5, label: "5s", credits: 1, falValue: "5" },
  { seconds: 10, label: "10s", credits: 2, falValue: "10" },
] as const;

export const FAL_MODEL_TEXT = "fal-ai/kling-video/v1.5/standard/text-to-video";
export const FAL_MODEL_IMAGE = "fal-ai/kling-video/v1.5/standard/image-to-video";

export const FREE_VIDEO_CREDITS = 5;
export const PRO_MONTHLY_CREDITS = 30;

export type VideoStyleKey = keyof typeof VIDEO_STYLES;
export type VideoRatioKey = keyof typeof VIDEO_RATIOS;
