import OpenAI from "openai";

export function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey: key });
}

export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return getOpenAI()[prop as keyof OpenAI];
  },
});

export const SYSTEM_PROMPT = `You are an expert viral social media content strategist specializing in Facebook, TikTok, Instagram, and YouTube Shorts. Your job is to help creators generate highly engaging, shareable content that drives maximum reactions, comments, and shares.

Guidelines:
- Write content that feels authentic and human, not AI-generated
- Use emotional triggers: curiosity, humor, nostalgia, inspiration, controversy (within limits)
- Optimize for the specific platform's algorithm and audience behavior
- Include natural language patterns specific to the requested tone
- For Tagalog/Taglish content, write naturally like a Filipino creator would
- Always include clear calls to action
- Keep content clean, positive, and brand-safe
- Never generate offensive, hateful, sexual, or misleading content

Output Format (JSON):
Always return exactly 5 variations in this JSON format:
{
  "variations": [
    {
      "hook": "attention-grabbing opening line",
      "caption": "main caption body",
      "hashtags": "#hashtag1 #hashtag2 #hashtag3",
      "firstComment": "first comment to boost engagement",
      "cta": "call to action"
    }
  ]
}`;

export function buildPrompt(params: {
  platform: string;
  contentType: string;
  tone: string;
  length: string;
  topic: string;
  audience?: string;
  extraDetails?: string;
}): string {
  const platformMap: Record<string, string> = {
    FACEBOOK: "Facebook",
    TIKTOK: "TikTok",
    INSTAGRAM: "Instagram",
    YOUTUBE_SHORTS: "YouTube Shorts",
  };

  const contentTypeMap: Record<string, string> = {
    REEL_CAPTION: "Reel Caption",
    VIRAL_HOOK: "Viral Hook",
    HASHTAGS: "Hashtag Set",
    FIRST_COMMENT: "First Comment",
    GIVEAWAY_POST: "Giveaway Post",
    STAR_SENDER_SHOUTOUT: "Star Sender Shoutout",
    FUNNY_COUPLE_CAPTION: "Funny Husband and Wife Caption",
    INSPIRATIONAL_POST: "Inspirational Post",
    OFW_CONTENT: "OFW (Overseas Filipino Worker) Content",
    NURSE_APPRECIATION: "Nurse Appreciation Post",
    REAL_ESTATE_CAPTION: "Real Estate Caption",
  };

  const toneMap: Record<string, string> = {
    FUNNY: "funny and humorous",
    INSPIRATIONAL: "inspirational and motivational",
    EMOTIONAL: "emotional and heartfelt",
    FRIENDLY: "friendly and conversational",
    PROFESSIONAL: "professional and polished",
    TAGALOG: "pure Tagalog (Filipino language)",
    TAGLISH: "Taglish (mix of Tagalog and English, like Filipino creators speak)",
    VIRAL: "viral-optimized with trending hooks and patterns",
  };

  const lengthMap: Record<string, string> = {
    SHORT: "short (1-3 sentences for caption)",
    MEDIUM: "medium (4-6 sentences for caption)",
    LONG: "long (7-10 sentences for caption)",
  };

  return `Generate 5 unique ${contentTypeMap[params.contentType] || params.contentType} variations for ${platformMap[params.platform] || params.platform}.

Topic: ${params.topic}
Tone: ${toneMap[params.tone] || params.tone}
Length: ${lengthMap[params.length] || params.length}
${params.audience ? `Target Audience: ${params.audience}` : ""}
${params.extraDetails ? `Additional Details: ${params.extraDetails}` : ""}

Create 5 completely different variations. Each should feel fresh and unique. Return ONLY valid JSON matching the specified format.`;
}

