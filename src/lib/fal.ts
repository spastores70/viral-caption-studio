import { fal } from "@fal-ai/client";

export function getFalClient() {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY is not set");

  fal.config({ credentials: key });
  return fal;
}

export interface FalVideoInput {
  prompt: string;
  negative_prompt?: string;
  duration: string;
  aspect_ratio: string;
  image_url?: string;
  cfg_scale?: number;
}

export interface FalVideoResult {
  video: {
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
  };
}
