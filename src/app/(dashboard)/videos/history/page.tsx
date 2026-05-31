"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  History, Video, ArrowLeft, Loader2, Trash2, Download,
  Play, CheckCircle2, Clock, AlertCircle, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { VIDEO_STYLES, VIDEO_RATIOS } from "@/lib/video-styles";
import type { VideoStyleKey, VideoRatioKey } from "@/lib/video-styles";
import { formatDate } from "@/lib/utils";

interface VideoRecord {
  id: string;
  prompt: string;
  style: VideoStyleKey;
  ratio: VideoRatioKey;
  duration: number;
  mode: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  videoUrl: string | null;
  creditsUsed: number;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

function StatusBadge({ status }: { status: VideoRecord["status"] }) {
  const map = {
    COMPLETED: { label: "Done", variant: "success" as const, icon: CheckCircle2 },
    QUEUED: { label: "Queued", variant: "secondary" as const, icon: Clock },
    PROCESSING: { label: "Processing", variant: "default" as const, icon: Loader2 },
    FAILED: { label: "Failed", variant: "destructive" as const, icon: AlertCircle },
  };
  const config = map[status];
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="text-[10px] gap-1 h-5">
      <Icon className={`h-2.5 w-2.5 ${status === "PROCESSING" ? "animate-spin" : ""}`} />
      {config.label}
    </Badge>
  );
}

export default function VideoHistoryPage() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});

  const fetch_ = async (p = 1) => {
    setLoading(true);
    const res = await fetch(`/api/video-history?page=${p}`);
    const data = await res.json();
    if (p === 1) setVideos(data.videos || []);
    else setVideos((prev) => [...prev, ...(data.videos || [])]);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => { fetch_(1); }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/video-history?id=${id}`, { method: "DELETE" });
    setVideos((prev) => prev.filter((v) => v.id !== id));
    setTotal((t) => t - 1);
    toast({ title: "Deleted" });
    setDeleteId(null);
  };

  const handleDownload = async (url: string, id: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `viral-video-${id}.mp4`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/videos">
          <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <History className="h-5 w-5 sm:h-6 sm:w-6 text-violet-400" />
            Video History
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-0.5">{total} total generations</p>
        </div>
      </div>

      {loading && videos.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-violet-400" />
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Video className="h-12 w-12 text-white/20 mb-4" />
          <h3 className="text-base font-semibold text-white mb-1">No video history yet</h3>
          <p className="text-sm text-white/40 mb-4">Your generated videos will appear here.</p>
          <Link href="/videos"><Button size="sm">Generate a Video</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-3 sm:p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white line-clamp-2 leading-snug">
                        {video.prompt}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <StatusBadge status={video.status} />
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {VIDEO_STYLES[video.style]?.emoji} {VIDEO_STYLES[video.style]?.label}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] h-5">
                          {VIDEO_RATIOS[video.ratio]?.label} · {video.duration}s
                        </Badge>
                        <span className="text-[10px] text-white/30">{formatDate(video.createdAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteId(video.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Video player */}
                  {video.status === "COMPLETED" && video.videoUrl && (
                    <div className="space-y-2">
                      <div className={`relative rounded-xl overflow-hidden bg-black border border-white/10 mx-auto ${
                        video.ratio === "PORTRAIT_9_16" ? "aspect-[9/16]" : video.ratio === "LANDSCAPE_16_9" ? "aspect-video" : "aspect-square"
                      }`}
                        style={video.ratio === "PORTRAIT_9_16" ? { maxWidth: "200px" } : { maxWidth: "100%" }}>
                        <video
                          ref={(el) => { if (el) videoRefs.current[video.id] = el; }}
                          src={video.videoUrl}
                          className="w-full h-full object-cover"
                          playsInline
                          loop
                          controls={playingId === video.id}
                          onClick={() => {
                            if (playingId !== video.id) {
                              videoRefs.current[video.id]?.play();
                              setPlayingId(video.id);
                            }
                          }}
                        />
                        {playingId !== video.id && (
                          <div
                            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                            onClick={() => { videoRefs.current[video.id]?.play(); setPlayingId(video.id); }}
                          >
                            <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all">
                              <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDownload(video.videoUrl!, video.id)}
                        className="flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-violet-500/30 bg-violet-600/10 hover:bg-violet-600/20 text-violet-300 text-sm font-medium transition-all active:scale-[0.98]"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  )}

                  {/* Failed */}
                  {video.status === "FAILED" && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/10 px-3 py-2">
                      <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                      <p className="text-xs text-white/50">{video.errorMessage || "Generation failed"}</p>
                    </div>
                  )}

                  {/* Re-use prompt */}
                  <Link href={`/videos?prompt=${encodeURIComponent(video.prompt)}&style=${video.style}&ratio=${video.ratio}&duration=${video.duration}`}>
                    <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" />
                      Use this prompt again
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {videos.length < total && (
            <Button variant="outline" className="w-full h-11" onClick={() => { const next = page + 1; setPage(next); fetch_(next); }} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Load more ({total - videos.length} remaining)
            </Button>
          )}
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="mx-4 max-w-sm">
          <DialogHeader><DialogTitle>Delete Video</DialogTitle></DialogHeader>
          <p className="text-sm text-white/60">Remove this video from your history? This cannot be undone.</p>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="ghost" className="w-full sm:w-auto h-11" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="w-full sm:w-auto h-11" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
