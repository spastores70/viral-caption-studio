import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFalClient } from "@/lib/fal";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("id");

    if (!videoId) {
      return NextResponse.json({ error: "Video ID required" }, { status: 400 });
    }

    const video = await db.generatedVideo.findFirst({
      where: { id: videoId, userId: session.user.id },
    });

    if (!video) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Already completed or failed — return immediately
    if (video.status === "COMPLETED" || video.status === "FAILED") {
      return NextResponse.json({
        status: video.status,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        errorMessage: video.errorMessage,
      });
    }

    if (!video.falRequestId) {
      return NextResponse.json({ status: video.status });
    }

    // Poll Fal queue
    const falClient = getFalClient();
    const queueStatus = await falClient.queue.status(video.falModel, {
      requestId: video.falRequestId,
      logs: false,
    });

    const falStatus = (queueStatus as any).status as string;

    if (falStatus === "COMPLETED") {
      // Fetch the result
      const result = await falClient.queue.result(video.falModel, {
        requestId: video.falRequestId,
      });

      const data = result.data as any;
      const videoUrl = data?.video?.url || null;

      await db.generatedVideo.update({
        where: { id: video.id },
        data: {
          status: "COMPLETED",
          videoUrl,
          completedAt: new Date(),
        },
      });

      return NextResponse.json({
        status: "COMPLETED",
        videoUrl,
        thumbnailUrl: null,
      });
    }

    if (falStatus === "FAILED" || (queueStatus as any).error) {
      const errMsg = (queueStatus as any).error || "Generation failed";
      await db.generatedVideo.update({
        where: { id: video.id },
        data: { status: "FAILED", errorMessage: errMsg },
      });
      return NextResponse.json({ status: "FAILED", errorMessage: errMsg });
    }

    // Still IN_QUEUE or IN_PROGRESS
    const newStatus = falStatus === "IN_PROGRESS" ? "PROCESSING" : "QUEUED";

    if (newStatus !== video.status) {
      await db.generatedVideo.update({
        where: { id: video.id },
        data: { status: newStatus as any },
      });
    }

    const queuePosition = (queueStatus as any).queue_position;

    return NextResponse.json({
      status: newStatus,
      queuePosition: queuePosition ?? null,
    });
  } catch (error: any) {
    console.error("Video status error:", error);
    return NextResponse.json(
      { error: "Failed to check status", status: "QUEUED" },
      { status: 500 }
    );
  }
}
