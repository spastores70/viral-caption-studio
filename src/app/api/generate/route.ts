import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { openai, SYSTEM_PROMPT, buildPrompt } from "@/lib/openai";
import { generateSchema } from "@/lib/validations";

const DAILY_FREE_LIMIT = 10;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = generateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const { platform, contentType, tone, length, topic, audience, extraDetails } = result.data;

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
          action: "GENERATE",
          date: { gte: today, lt: tomorrow },
        },
        _sum: { count: true },
      });

      const used = todayCount._sum.count || 0;
      if (used >= DAILY_FREE_LIMIT) {
        return NextResponse.json(
          { error: "Daily generation limit reached. Upgrade to Pro for unlimited generations." },
          { status: 429 }
        );
      }
    }

    const userPrompt = buildPrompt({
      platform,
      contentType,
      tone,
      length,
      topic,
      audience,
      extraDetails,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.9,
      max_tokens: 3000,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    const variations = parsed.variations;

    if (!variations || !Array.isArray(variations) || variations.length === 0) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    const [generationRecord] = await Promise.all([
      db.generatedContent.create({
        data: {
          userId: session.user.id,
          platform: platform as any,
          contentType: contentType as any,
          tone: tone as any,
          length: length as any,
          topic,
          audience,
          extraDetails,
          results: variations,
        },
      }),
      db.usageLog.upsert({
        where: {
          id: `${session.user.id}-${new Date().toISOString().split("T")[0]}-GENERATE`,
        },
        update: { count: { increment: 1 } },
        create: {
          id: `${session.user.id}-${new Date().toISOString().split("T")[0]}-GENERATE`,
          userId: session.user.id,
          action: "GENERATE",
          count: 1,
        },
      }).catch(() =>
        db.usageLog.create({
          data: {
            userId: session.user.id,
            action: "GENERATE",
            count: 1,
          },
        })
      ),
    ]);

    return NextResponse.json({
      variations,
      generationId: generationRecord.id,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate content. Please try again." },
      { status: 500 }
    );
  }
}

