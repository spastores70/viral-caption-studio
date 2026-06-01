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

    // Already settled — return from DB
    if (video.status === "COMPLETED" || video.status === "FAILED") {
      return NextResponse.json({
        status: video.status,
        videoUrl: video.videoUrl,
        errorMessage: video.errorMessage,
      });
    }

    if (!video.falRequestId) {
      return NextResponse.json({ status: video.status });
    }

    const falClient = getFalClient();

    // Check Fal queue status
    let queueStatus: any;
    try {
      queueStatus = await falClient.queue.status(video.falModel, {
        requestId: video.falRequestId,
        logs: false,
      });
    } catch (statusErr: any) {
      // Fal throws when request ID is unknown or expired
      const msg = statusErr?.message || String(statusErr);
      console.error("Fal queue.status error:", msg);

      await db.generatedVideo.update({
        where: { id: video.id },
        data: { status: "FAILED", errorMessage: msg },
      });
      return NextResponse.json({ status: "FAILED", errorMessage: msg });
    }

    // Fal SDK v1.x wraps the response — status may be at root or nested
    const falStatus: string =
      (queueStatus as any)?.status ??
      (queueStatus as any)?.queue_status ??
      "IN_QUEUE";

    console.log(`Fal status for ${video.falRequestId}:`, falStatus, JSON.stringify(queueStatus).slice(0, 200));

    if (falStatus === "COMPLETED") {
      let videoUrl: string | null = null;
      try {
        const result = await falClient.queue.result(video.falModel, {
          requestId: video.falRequestId,
        });
        const data = (result as any)?.data ?? result;
        // Kling returns { video: { url: "..." } }
        videoUrl = data?.video?.url ?? data?.video_url ?? null;
        console.log("Fal result data keys:", Object.keys(data || {}), "videoUrl:", videoUrl);
      } catch (resultErr: any) {
        console.error("Fal queue.result error:", resultErr?.message);
      }

      await db.generatedVideo.update({
        where: { id: video.id },
        data: { status: "COMPLETED", videoUrl, completedAt: new Date() },
      });

      return NextResponse.json({ status: "COMPLETED", videoUrl });
    }

    // Handle failure states
    const falError = (queueStatus as any)?.error;
    if (falStatus === "FAILED" || falStatus === "ERROR" || falError) {
      const errMsg = falError || `Fal returned status: ${falStatus}`;
      console.error("Fal generation failed:", errMsg);

      await db.generatedVideo.update({
        where: { id: video.id },
        data: { status: "FAILED", errorMessage: errMsg },
      });
      return NextResponse.json({ status: "FAILED", errorMessage: errMsg });
    }

    // Still running — IN_QUEUE or IN_PROGRESS
    const appStatus = falStatus === "IN_PROGRESS" ? "PROCESSING" : "QUEUED";
    if (appStatus !== video.status) {
      await db.generatedVideo.update({
        where: { id: video.id },
        data: { status: appStatus as any },
      });
    }

    return NextResponse.json({
      status: appStatus,
      queuePosition: (queueStatus as any)?.queue_position ?? null,
    });
  } catch (error: any) {
    console.error("video-status route error:", error?.message || error);
    return NextResponse.json(
      { status: "QUEUED", error: error?.message },
      { status: 500 }
    );
  }
}
