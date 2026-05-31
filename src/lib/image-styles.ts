export const IMAGE_STYLES = {
  REALISTIC: {
    label: "Realistic",
    emoji: "📸",
    description: "Photorealistic, high detail",
    prefix:
      "Ultra-realistic, photographic, 8K resolution, professional photography, sharp focus, natural lighting, detailed textures, DSLR quality,",
  },
  CINEMATIC: {
    label: "Cinematic",
    emoji: "🎬",
    description: "Dramatic film look",
    prefix:
      "Cinematic style, dramatic lighting, shallow depth of field, film grain, movie still, widescreen composition, professional color grading, epic atmosphere,",
  },
  CARTOON: {
    label: "Cartoon",
    emoji: "🎨",
    description: "Bold, colorful, animated",
    prefix:
      "Vibrant cartoon style, bold outlines, bright saturated colors, clean illustration, Pixar-inspired, 3D render, playful and fun,",
  },
  ANIME: {
    label: "Anime",
    emoji: "⛩️",
    description: "Japanese anime aesthetic",
    prefix:
      "Anime art style, manga-inspired illustration, vibrant colors, detailed character design, Studio Ghibli aesthetic, clean line art, expressive,",
  },
  FACEBOOK_POST: {
    label: "FB Post",
    emoji: "📱",
    description: "Social media ready",
    prefix:
      "Eye-catching social media post design, Facebook-optimized, colorful and engaging, clean layout with space for text overlay, modern graphic design,",
  },
  FACEBOOK_REEL_COVER: {
    label: "Reel Cover",
    emoji: "🎥",
    description: "Vertical reel thumbnail",
    prefix:
      "Vertical format reel cover, eye-catching Facebook Reels thumbnail, bold visual impact, space for text overlay at top and bottom, vibrant colors, high contrast,",
  },
  MOTIVATIONAL: {
    label: "Motivational",
    emoji: "💪",
    description: "Inspiring poster style",
    prefix:
      "Inspirational motivational poster, powerful imagery, dramatic lighting, space for bold text overlay, sunrise or achievement imagery, epic and uplifting atmosphere,",
  },
  PROFESSIONAL: {
    label: "Professional",
    emoji: "💼",
    description: "Clean business look",
    prefix:
      "Clean professional corporate style, minimal design, elegant and sophisticated, business-appropriate, high quality commercial photography, neutral tones,",
  },
} as const;

export const IMAGE_RATIOS = {
  SQUARE: {
    label: "1:1",
    description: "Square",
    icon: "⬜",
    dalleSize: "1024x1024" as const,
    width: 1,
    height: 1,
  },
  PORTRAIT_4_5: {
    label: "4:5",
    description: "Portrait",
    icon: "📱",
    dalleSize: "1024x1024" as const, // DALL-E 3 closest
    width: 4,
    height: 5,
  },
  PORTRAIT_9_16: {
    label: "9:16",
    description: "Vertical",
    icon: "📲",
    dalleSize: "1024x1792" as const,
    width: 9,
    height: 16,
  },
  LANDSCAPE_16_9: {
    label: "16:9",
    description: "Widescreen",
    icon: "🖥️",
    dalleSize: "1792x1024" as const,
    width: 16,
    height: 9,
  },
} as const;

export type ImageStyleKey = keyof typeof IMAGE_STYLES;
export type ImageRatioKey = keyof typeof IMAGE_RATIOS;

export const FREE_DAILY_IMAGE_LIMIT = 3;  // 3 generations = 12 images
export const PRO_DAILY_IMAGE_LIMIT = 50;
