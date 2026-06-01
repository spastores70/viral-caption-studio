import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFalClient } from "@/lib/fal";
import { getOpenAI } from "@/lib/openai";
import {
  VIDEO_STYLES, VIDEO_RATIOS, VIDEO_DURATIONS,
  FAL_MODEL_TEXT, FAL_MODEL_IMAGE,
} from "@/lib/video-styles";
import { z } from "zod";

const schema = z.object({
  prompt: z.string().min(3).max(1000),
  style: z.enum(["CINEMATIC", "REALISTIC", "CARTOON", "FANTASY", "VIRAL_SOCIAL"]),
  ratio: z.enum(["PORTRAIT_9_16", "LANDSCAPE_16_9", "SQUARE_1_1"]),
  duration: z.number().refine((d) => [5, 10].includes(d)),
  mode: z.enum(["TEXT_TO_VIDEO", "IMAGE_TO_VIDEO"]),
  imageUrl: z.string().url().optional(),
  enhancePrompt: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { prompt, style, ratio, duration, mode, imageUrl, enhancePrompt } = parsed.data;

    if (mode === "IMAGE_TO_VIDEO" && !imageUrl) {
      return NextResponse.json({ error: "Image URL required for image-to-video mode" }, { status: 400 });
    }

    // Check/create credits record
    let credits = await db.videoCredit.findUnique({ where: { userId: session.user.id } });
    if (!credits) {
      credits = await db.videoCredit.create({
        data: { userId: session.user.id, balance: 5, totalUsed: 0 },
      });
    }

    const durationConfig = VIDEO_DURATIONS.find((d) => d.seconds === duration)!;
    const creditsNeeded = durationConfig.credits;

    // Pro users get unlimited (check subscription)
    const subscription = await db.subscription.findUnique({ where: { userId: session.user.id } });
    const isPro = subscription?.plan === "PRO" || subscription?.plan === "CREATOR_PRO" || session.user.role === "ADMIN";

    if (!isPro && credits.balance < creditsNeeded) {
      return NextResponse.json(
        {
          error: `Not enough credits. You need ${creditsNeeded} credit${creditsNeeded > 1 ? "s" : ""} but have ${credits.balance}. Upgrade to Pro for 30 credits/month.`,
          needsUpgrade: true,
        },
        { status: 402 }
      );
    }

    // Enhance prompt with OpenAI
    let finalPrompt = prompt;
    if (enhancePrompt) {
      try {
        const openai = getOpenAI();
        const styleConfig = VIDEO_STYLES[style];
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a video prompt engineer. Enhance the user's prompt for AI video generation. Be descriptive about motion, camera movement, lighting, and atmosphere. Keep it under 200 words. Return ONLY the enhanced prompt, no explanation.",
            },
            {
              role: "user",
              content: `Enhance this prompt for a ${styleConfig.label} style video: "${prompt}"\n\nAdd: ${styleConfig.promptSuffix}`,
            },
          ],
          max_tokens: 300,
          temperature: 0.7,
        });
        finalPrompt = completion.choices[0].message.content?.trim() || prompt;
      } catch {
        // Fall back to manual enhancement
        finalPrompt = `${prompt}, ${VIDEO_STYLES[style].promptSuffix}`;
      }
    }

    const styleConfig = VIDEO_STYLES[style];
    const ratioConfig = VIDEO_RATIOS[ratio];
    const falModel = mode === "IMAGE_TO_VIDEO" ? FAL_MODEL_IMAGE : FAL_MODEL_TEXT;

    // Submit to Fal AI queue
    const falClient = getFalClient();

    // Build input — only include params Kling v1.5 actually supports
    const falInput: Record<string, unknown> = {
      prompt: finalPrompt,
      negative_prompt: styleConfig.negativePrompt,
      duration: durationConfig.falValue,   // "5" | "10"
      aspect_ratio: ratioConfig.falValue,  // "9:16" | "16:9" | "1:1"
    };
    if (mode === "IMAGE_TO_VIDEO" && imageUrl) {
      falInput.image_url = imageUrl;
    }

    const submitResult = await falClient.queue.submit(falModel, { input: falInput });
    const request_id = (submitResult as any).request_id as string;

    // Deduct credits (pro users: don't deduct)
    if (!isPro) {
      await db.videoCredit.update({
        where: { userId: session.user.id },
        data: {
          balance: { decrement: creditsNeeded },
          totalUsed: { increment: creditsNeeded },
        },
      });
    }

    // Create DB record
    const video = await db.generatedVideo.create({
      data: {
        userId: session.user.id,
        prompt,
        enhancedPrompt: finalPrompt,
        imageUrl,
        style: style as any,
        ratio: ratio as any,
        duration,
        mode: mode as any,
        falModel,
        falRequestId: request_id,
        status: "QUEUED",
        creditsUsed: isPro ? 0 : creditsNeeded,
      },
    });

    return NextResponse.json({
      videoId: video.id,
      requestId: request_id,
      creditsUsed: isPro ? 0 : creditsNeeded,
      remainingCredits: isPro ? -1 : credits.balance - creditsNeeded,
    });
  } catch (error: any) {
    console.error("Video generation error:", error);
    if (error?.message?.includes("FAL_KEY")) {
      return NextResponse.json(
        { error: "Video generation is not configured. Please add your FAL_KEY." },
        { status: 503 }
      );
    }
    const detail = error?.body?.detail || error?.message || String(error);
    console.error("Fal submit detail:", detail);
    return NextResponse.json(
      { error: `Video generation failed: ${detail}` },
      { status: 500 }
    );
  }
}
