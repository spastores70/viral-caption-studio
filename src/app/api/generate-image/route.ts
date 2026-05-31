import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOpenAI } from "@/lib/openai";
import { IMAGE_STYLES, IMAGE_RATIOS, FREE_DAILY_IMAGE_LIMIT } from "@/lib/image-styles";
import { z } from "zod";

const schema = z.object({
  prompt: z.string().min(3).max(1000),
  style: z.enum([
    "REALISTIC", "CINEMATIC", "CARTOON", "ANIME",
    "FACEBOOK_POST", "FACEBOOK_REEL_COVER", "MOTIVATIONAL", "PROFESSIONAL",
  ]),
  ratio: z.enum(["SQUARE", "PORTRAIT_4_5", "PORTRAIT_9_16", "LANDSCAPE_16_9"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
    }

    const { prompt, style, ratio } = result.data;

    // Check usage limit for free users
    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
    });
    const isPro =
      subscription?.plan === "PRO" ||
      subscription?.plan === "CREATOR_PRO" ||
      session.user.role === "ADMIN";

    if (!isPro) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayCount = await db.usageLog.aggregate({
        where: {
          userId: session.user.id,
          action: "IMAGE_GENERATE",
          date: { gte: today, lt: tomorrow },
        },
        _sum: { count: true },
      });

      if ((todayCount._sum.count || 0) >= FREE_DAILY_IMAGE_LIMIT) {
        return NextResponse.json(
          { error: "Daily image generation limit reached. Upgrade to Pro for more." },
          { status: 429 }
        );
      }
    }

    const styleConfig = IMAGE_STYLES[style];
    const ratioConfig = IMAGE_RATIOS[ratio];
    const dalleSize = ratioConfig.dalleSize;

    // Build enhanced prompt
    const enhancedPrompt = `${styleConfig.prefix} ${prompt}. High quality, professional result.`;

    const openai = getOpenAI();

    // Generate 4 images in parallel (DALL-E 3 only supports n=1)
    const imagePromises = Array.from({ length: 4 }, () =>
      openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        size: dalleSize,
        quality: "standard",
        n: 1,
      })
    );

    const results = await Promise.allSettled(imagePromises);

    const imageUrls: string[] = [];
    const revisedPrompts: string[] = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        const img = result.value.data?.[0];
        if (img?.url) {
          imageUrls.push(img.url);
          revisedPrompts.push(img.revised_prompt || "");
        }
      }
    }

    if (imageUrls.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate images. Please try again." },
        { status: 500 }
      );
    }

    // Save to DB + log usage in parallel
    const [record] = await Promise.all([
      db.generatedImage.create({
        data: {
          userId: session.user.id,
          prompt,
          style: style as any,
          ratio: ratio as any,
          dalleSize,
          imageUrls,
          revisedPrompts,
        },
      }),
      db.usageLog.create({
        data: {
          userId: session.user.id,
          action: "IMAGE_GENERATE",
          count: 1,
        },
      }),
    ]);

    return NextResponse.json({
      id: record.id,
      imageUrls,
      revisedPrompts,
      style,
      ratio,
      prompt,
    });
  } catch (error: any) {
    console.error("Image generation error:", error);

    if (error?.status === 400 && error?.message?.includes("safety")) {
      return NextResponse.json(
        { error: "Your prompt was flagged by the content filter. Please try a different description." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate images. Please try again." },
      { status: 500 }
    );
  }
}
