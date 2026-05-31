"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Video, Wand2, Upload, Link2, Loader2, Download, RefreshCw,
  History, Zap, ChevronDown, ChevronUp, Sparkles, X, Play,
  CheckCircle2, Clock, AlertCircle, Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  VIDEO_STYLES, VIDEO_RATIOS, VIDEO_DURATIONS,
} from "@/lib/video-styles";
import type { VideoStyleKey, VideoRatioKey } from "@/lib/video-styles";

/* ── Types ─────────────────────────────────────────── */
type GenerationStatus = "idle" | "submitting" | "queued" | "processing" | "completed" | "failed";

interface VideoResult {
  videoId: string;
  videoUrl: string | null;
  status: GenerationStatus;
  queuePosition?: number | null;
  errorMessage?: string;
}

interface Credits {
  balance: number;
  totalUsed: number;
  isPro: boolean;
}

/* ── Credit Badge ───────────────────────────────────── */
function CreditBadge({ credits, cost }: { credits: Credits | null; cost: number }) {
  if (!credits) return null;
  const canAfford = credits.isPro || credits.balance >= cost;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium ${
      credits.isPro
        ? "border-violet-500/30 bg-violet-600/10 text-violet-300"
        : canAfford
        ? "border-emerald-500/30 bg-emerald-600/10 text-emerald-300"
        : "border-red-500/30 bg-red-600/10 text-red-300"
    }`}>
      <Coins className="h-3 w-3" />
      {credits.isPro ? "Pro — unlimited" : `${credits.balance} credits`}
      {!credits.isPro && (
        <span className="text-white/40 ml-0.5">· costs {cost}</span>
      )}
    </div>
  );
}

/* ── Video Player ───────────────────────────────────── */
function VideoPlayer({ url, ratio }: { url: string; ratio: VideoRatioKey }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const aspectClass =
    ratio === "LANDSCAPE_16_9" ? "aspect-video"
    : ratio === "PORTRAIT_9_16" ? "aspect-[9/16] max-h-[70vh]"
    : "aspect-square";

  const handleDownload = async () => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `viral-video-${Date.now()}.mp4`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="space-y-3">
      <div className={`relative w-full ${aspectClass} bg-black rounded-2xl overflow-hidden border border-white/10 mx-auto`}
        style={ratio === "PORTRAIT_9_16" ? { maxWidth: "280px" } : {}}>
        <video
          ref={videoRef}
          src={url}
          className="w-full h-full object-cover"
          playsInline
          loop
          controls={playing}
          onClick={() => {
            if (!playing) {
              videoRef.current?.play();
              setPlaying(true);
            }
          }}
        />
        {!playing && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            onClick={() => { videoRef.current?.play(); setPlaying(true); }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 active:scale-95 transition-all">
              <Play className="h-7 w-7 text-white fill-white ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="gradient"
          className="flex-1 h-11 gap-2"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          Download Video
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0"
          onClick={() => window.open(url, "_blank")}
          title="Open in new tab"
        >
          <Link2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ── Progress Panel ─────────────────────────────────── */
function GenerationProgress({
  status,
  queuePosition,
  style,
  duration,
}: {
  status: GenerationStatus;
  queuePosition?: number | null;
  style: VideoStyleKey;
  duration: number;
}) {
  const [elapsed, setElapsed] = useState(0);
  const estimatedSeconds = duration === 5 ? 90 : 180;

  useEffect(() => {
    if (status !== "processing" && status !== "queued") { setElapsed(0); return; }
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  const progress = Math.min((elapsed / estimatedSeconds) * 90, 90);

  const statusMessages: Record<string, string> = {
    submitting: "Submitting your request...",
    queued: queuePosition
      ? `Queue position: ${queuePosition}`
      : "Waiting in queue...",
    processing: `Generating your ${duration}s video...`,
  };

  const steps = [
    { label: "Submitted", done: ["queued", "processing", "completed"].includes(status) },
    { label: "In Queue", done: ["processing", "completed"].includes(status) },
    { label: "Rendering", done: ["completed"].includes(status) },
    { label: "Done", done: status === "completed" },
  ];

  return (
    <Card className="border-violet-500/30 bg-violet-600/10">
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  step.done
                    ? "border-violet-500 bg-violet-600"
                    : status === "processing" && i === 2
                    ? "border-violet-400 bg-violet-600/30 animate-pulse"
                    : "border-white/20 bg-white/5"
                }`}>
                  {step.done
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    : status === "processing" && i === 2
                    ? <Loader2 className="h-3 w-3 text-violet-400 animate-spin" />
                    : <span className="text-[9px] text-white/30">{i + 1}</span>}
                </div>
                <span className={`text-[9px] font-medium ${step.done ? "text-violet-300" : "text-white/30"}`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px w-8 sm:w-12 mx-1 sm:mx-2 mb-4 transition-all ${
                  steps[i + 1].done || (status === "processing" && i === 1)
                    ? "bg-violet-500"
                    : "bg-white/10"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <Progress value={status === "completed" ? 100 : progress} className="h-1.5" />
          <p className="text-xs text-white/60 text-center">
            {statusMessages[status] || "Processing..."}
          </p>
        </div>

        {/* Time estimate */}
        <div className="flex items-center justify-center gap-2 text-xs text-white/40">
          <Clock className="h-3 w-3" />
          <span>
            {elapsed > 0 ? `${elapsed}s elapsed · ` : ""}
            Est. {estimatedSeconds}–{estimatedSeconds + 60}s total
          </span>
        </div>

        {/* Style indicator */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-lg">{VIDEO_STYLES[style].emoji}</span>
          <span className="text-xs text-white/50">
            {VIDEO_STYLES[style].label} · {duration}s
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Main Page ──────────────────────────────────────── */
export default function VideosPage() {
  const { toast } = useToast();

  const [mode, setMode] = useState<"TEXT_TO_VIDEO" | "IMAGE_TO_VIDEO">("TEXT_TO_VIDEO");
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [style, setStyle] = useState<VideoStyleKey>("CINEMATIC");
  const [ratio, setRatio] = useState<VideoRatioKey>("PORTRAIT_9_16");
  const [duration, setDuration] = useState(5);
  const [enhancePrompt, setEnhancePrompt] = useState(true);

  const [genStatus, setGenStatus] = useState<GenerationStatus>("idle");
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [showEnhanced, setShowEnhanced] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState("");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Fetch credits on mount
  useEffect(() => {
    fetch("/api/video-credits")
      .then((r) => r.json())
      .then(setCredits)
      .catch(() => {});

    return () => stopPolling();
  }, [stopPolling]);

  const creditCost = VIDEO_DURATIONS.find((d) => d.seconds === duration)?.credits ?? 1;

  // Poll for video status
  const startPolling = useCallback((videoId: string) => {
    stopPolling();
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/video-status?id=${videoId}`);
        const data = await res.json();

        if (data.status === "COMPLETED") {
          stopPolling();
          setGenStatus("completed");
          setVideoResult({
            videoId,
            videoUrl: data.videoUrl,
            status: "completed",
          });
          // Refresh credits
          fetch("/api/video-credits").then((r) => r.json()).then(setCredits);
          toast({ title: "Video ready! 🎬", description: "Your video has been generated." });
        } else if (data.status === "FAILED") {
          stopPolling();
          setGenStatus("failed");
          setVideoResult({
            videoId,
            videoUrl: null,
            status: "failed",
            errorMessage: data.errorMessage,
          });
          toast({ title: "Generation failed", description: data.errorMessage || "Please try again.", variant: "destructive" });
        } else {
          setGenStatus(data.status === "PROCESSING" ? "processing" : "queued");
          if (data.queuePosition !== undefined) {
            setVideoResult((prev) => prev ? { ...prev, queuePosition: data.queuePosition } : null);
          }
        }
      } catch {
        // Keep polling on network errors
      }
    }, 5000);
  }, [stopPolling, toast]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Prompt required", description: "Describe your video.", variant: "destructive" });
      return;
    }
    if (mode === "IMAGE_TO_VIDEO" && !imageUrl.trim()) {
      toast({ title: "Image required", description: "Provide an image URL for image-to-video.", variant: "destructive" });
      return;
    }

    stopPolling();
    setGenStatus("submitting");
    setVideoResult(null);
    setEnhancedPrompt("");

    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, imageUrl: mode === "IMAGE_TO_VIDEO" ? imageUrl : undefined, style, ratio, duration, mode, enhancePrompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGenStatus("idle");
        if (res.status === 402) {
          toast({ title: "Insufficient credits", description: data.error, variant: "destructive" });
        } else if (res.status === 503) {
          toast({ title: "Not configured", description: "Add your FAL_KEY to enable video generation.", variant: "destructive" });
        } else {
          toast({ title: "Error", description: data.error, variant: "destructive" });
        }
        return;
      }

      setCurrentVideoId(data.videoId);
      setGenStatus("queued");
      setVideoResult({ videoId: data.videoId, videoUrl: null, status: "queued" });

      // Update credits optimistically
      if (credits && !credits.isPro) {
        setCredits((prev) => prev ? { ...prev, balance: prev.balance - data.creditsUsed } : prev);
      }

      toast({ title: "Video generation started!", description: "This usually takes 1–3 minutes." });
      startPolling(data.videoId);
    } catch {
      setGenStatus("idle");
      toast({ title: "Error", description: "Failed to start generation.", variant: "destructive" });
    }
  };

  const isGenerating = ["submitting", "queued", "processing"].includes(genStatus);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Video className="h-5 w-5 sm:h-6 sm:w-6 text-violet-400" />
            AI Video Generator
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-0.5">
            Powered by Kling AI via Fal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreditBadge credits={credits} cost={creditCost} />
          <Link href="/videos/history">
            <button className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-all">
              <History className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">History</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 gap-1">
        {(["TEXT_TO_VIDEO", "IMAGE_TO_VIDEO"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition-all ${
              mode === m
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                : "text-white/50 hover:text-white active:bg-white/10"
            }`}
          >
            {m === "TEXT_TO_VIDEO" ? (
              <><Wand2 className="h-4 w-4" />Text to Video</>
            ) : (
              <><Upload className="h-4 w-4" />Image to Video</>
            )}
          </button>
        ))}
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-5">

          {/* Prompt */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white/80">
                {mode === "TEXT_TO_VIDEO" ? "Describe your video" : "Describe the motion"}
                <span className="text-red-400 ml-0.5">*</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <span className="text-xs text-white/40">AI enhance</span>
                <div
                  onClick={() => setEnhancePrompt((e) => !e)}
                  className={`relative w-8 h-4 rounded-full transition-all cursor-pointer ${enhancePrompt ? "bg-violet-600" : "bg-white/20"}`}
                >
                  <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${enhancePrompt ? "left-4.5 translate-x-0.5" : "left-0.5"}`} />
                </div>
              </label>
            </div>
            <Textarea
              placeholder={
                mode === "TEXT_TO_VIDEO"
                  ? "e.g. A Filipino nurse walking through a hospital hallway, golden hour light streaming through windows..."
                  : "e.g. Camera slowly zooms in, subject turns to face camera, warm smile..."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              maxLength={1000}
              className="text-base resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-white/30">{prompt.length}/1000</span>
              {enhancePrompt && (
                <span className="text-[11px] text-violet-400 flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" />
                  AI will enhance this prompt
                </span>
              )}
            </div>
          </div>

          {/* Image URL (image-to-video only) */}
          {mode === "IMAGE_TO_VIDEO" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/80">
                Image URL <span className="text-red-400">*</span>
              </label>
              <Input
                type="url"
                inputMode="url"
                placeholder="https://example.com/your-image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="h-11 text-base"
              />
              <p className="text-xs text-white/30">
                Paste a public image URL. Use AI Image Generator to create one first.
              </p>
              {imageUrl && (
                <div className="relative h-24 w-24 rounded-xl overflow-hidden border border-white/10 mt-2">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                </div>
              )}
            </div>
          )}

          {/* Style selector */}
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-white/80">Style</label>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {(Object.keys(VIDEO_STYLES) as VideoStyleKey[]).map((key) => {
                const s = VIDEO_STYLES[key];
                const isActive = style === key;
                return (
                  <button
                    key={key}
                    onClick={() => setStyle(key)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all min-h-[60px] sm:min-h-[72px] ${
                      isActive
                        ? "border-violet-500/70 bg-violet-600/20 text-violet-300"
                        : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10 active:bg-white/15"
                    }`}
                  >
                    <span className="text-xl sm:text-2xl leading-none">{s.emoji}</span>
                    <span className="text-[9px] sm:text-[11px] font-medium leading-tight text-center">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ratio + Duration row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Format</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(VIDEO_RATIOS) as VideoRatioKey[]).map((key) => {
                  const r = VIDEO_RATIOS[key];
                  const isActive = ratio === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setRatio(key)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all min-h-[54px] ${
                        isActive
                          ? "border-violet-500/70 bg-violet-600/20 text-violet-300"
                          : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-base">{r.emoji}</span>
                      <span className="text-[10px] font-semibold">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Duration</label>
              <div className="grid grid-cols-2 gap-1.5">
                {VIDEO_DURATIONS.map((d) => {
                  const isActive = duration === d.seconds;
                  return (
                    <button
                      key={d.seconds}
                      onClick={() => setDuration(d.seconds)}
                      className={`flex flex-col items-center gap-0.5 p-2 rounded-xl border transition-all min-h-[54px] ${
                        isActive
                          ? "border-violet-500/70 bg-violet-600/20 text-violet-300"
                          : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-base font-bold">{d.label}</span>
                      <span className="text-[10px] opacity-60">{d.credits} cr</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Generate */}
          <Button
            className="w-full gap-2.5"
            style={{ height: "52px", fontSize: "1rem" }}
            variant="gradient"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <><Loader2 className="h-5 w-5 animate-spin" />Generating...</>
            ) : (
              <><Video className="h-5 w-5" />Generate Video ({creditCost} credit{creditCost > 1 ? "s" : ""})</>
            )}
          </Button>

          {/* No credits warning */}
          {credits && !credits.isPro && credits.balance < creditCost && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-600/10 p-3">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-amber-300 font-medium">Not enough credits</p>
                <p className="text-[11px] text-white/50">You have {credits.balance} credits but need {creditCost}.</p>
              </div>
              <Link href="/billing">
                <Button size="sm" variant="gradient" className="h-8 text-xs shrink-0 gap-1">
                  <Zap className="h-3 w-3" />Pro
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress */}
      {isGenerating && (
        <GenerationProgress
          status={genStatus}
          queuePosition={videoResult?.queuePosition}
          style={style}
          duration={duration}
        />
      )}

      {/* Result */}
      {genStatus === "completed" && videoResult?.videoUrl && (
        <Card className="border-emerald-500/30 bg-emerald-600/10">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-semibold text-white">Video Generated!</span>
              <Badge variant="success" className="text-[10px] ml-auto">
                {VIDEO_STYLES[style].emoji} {VIDEO_STYLES[style].label} · {duration}s
              </Badge>
            </div>

            <VideoPlayer url={videoResult.videoUrl} ratio={ratio} />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-11 gap-2"
                onClick={handleGenerate}
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </Button>
              <Button
                variant="ghost"
                className="flex-1 h-11 gap-2 text-white/60"
                onClick={() => { setGenStatus("idle"); setVideoResult(null); setPrompt(""); }}
              >
                <Wand2 className="h-4 w-4" />
                New Video
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failed */}
      {genStatus === "failed" && (
        <Card className="border-red-500/30 bg-red-600/10">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white mb-1">Generation failed</p>
                <p className="text-xs text-white/60 mb-3">{videoResult?.errorMessage || "Something went wrong. Please try again."}</p>
                <Button size="sm" variant="outline" className="gap-2 h-9" onClick={() => { setGenStatus("idle"); setVideoResult(null); }}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {genStatus === "idle" && !videoResult && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="h-16 w-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mb-4">
            <Video className="h-8 w-8 text-violet-400" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">Create a Video</h3>
          <p className="text-sm text-white/40 max-w-xs leading-relaxed mb-5">
            Describe your scene, choose a style and format, then generate a high-quality AI video.
          </p>

          {/* Example prompts */}
          <div className="w-full max-w-sm space-y-2">
            <p className="text-[11px] text-white/30 uppercase tracking-wide font-medium mb-2">Try these</p>
            {[
              "A beautiful sunset over Manila Bay, cinematic slow motion",
              "Filipino street food vendor smiling, bokeh background",
              "Motivational quote appears with golden particles effect",
              "Happy family reunion, warm golden light, slow zoom",
            ].map((ex) => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                className="w-full text-left text-xs text-white/50 hover:text-white/80 px-3 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 active:bg-white/15 transition-all min-h-[44px]"
              >
                &ldquo;{ex}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Credits info card */}
      <Card className="border-white/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Coins className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-white mb-1">Video Credits</p>
              <p className="text-xs text-white/50 leading-relaxed">
                Free: 5 starter credits · Pro: 30/month · 5s = 1 credit · 10s = 2 credits.
                Credits are used when generation starts, not when completed.
              </p>
              {credits && !credits.isPro && (
                <Link href="/billing">
                  <button className="text-xs text-violet-400 hover:text-violet-300 mt-1.5 transition-colors">
                    Upgrade to Pro for 30 credits/month →
                  </button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
