"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  ImageIcon, Wand2, Download, RefreshCw, Loader2, History,
  Zap, ChevronDown, ChevronUp, Copy, Check, Sparkles, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { IMAGE_STYLES, IMAGE_RATIOS, FREE_DAILY_IMAGE_LIMIT } from "@/lib/image-styles";
import type { ImageStyleKey, ImageRatioKey } from "@/lib/image-styles";
import Link from "next/link";

interface GenerationResult {
  id: string;
  imageUrls: string[];
  revisedPrompts: string[];
  style: ImageStyleKey;
  ratio: ImageRatioKey;
  prompt: string;
}

/* ── Aspect ratio visual helper ──────────────────────── */
function RatioBox({ ratio }: { ratio: ImageRatioKey }) {
  const r = IMAGE_RATIOS[ratio];
  const maxW = 20;
  const maxH = 20;
  const scale = Math.min(maxW / r.width, maxH / r.height);
  const w = Math.round(r.width * scale);
  const h = Math.round(r.height * scale);
  return (
    <div
      className="border-2 border-current rounded-sm"
      style={{ width: w, height: h }}
    />
  );
}

/* ── Single generated image card ─────────────────────── */
function ImageCard({
  url,
  index,
  ratio,
  prompt,
}: {
  url: string;
  index: number;
  ratio: ImageRatioKey;
  prompt: string;
}) {
  const { toast } = useToast();
  const [lightbox, setLightbox] = useState(false);
  const r = IMAGE_RATIOS[ratio];

  const aspectClass =
    ratio === "LANDSCAPE_16_9"
      ? "aspect-video"
      : ratio === "PORTRAIT_9_16"
      ? "aspect-[9/16]"
      : ratio === "PORTRAIT_4_5"
      ? "aspect-[4/5]"
      : "aspect-square";

  const handleDownload = async () => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `viral-caption-studio-image-${index + 1}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      // fallback: open in new tab
      window.open(url, "_blank");
    }
    toast({ title: "Downloading image..." });
  };

  return (
    <>
      <div className="group relative rounded-xl overflow-hidden bg-white/5 border border-white/10">
        {/* Image */}
        <div className={`relative w-full ${aspectClass} cursor-pointer`} onClick={() => setLightbox(true)}>
          <Image
            src={url}
            alt={`Generated image ${index + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized // DALL-E URLs not in next.config remotePatterns
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="text-white text-xs font-medium bg-black/50 rounded-full px-3 py-1">
              Tap to expand
            </span>
          </div>
          {/* Number badge */}
          <div className="absolute top-2 left-2">
            <span className="text-[10px] font-semibold bg-black/60 text-white rounded-full px-2 py-0.5">
              {index + 1}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-2.5 border-t border-white/10">
          <button
            onClick={() => setLightbox(true)}
            className="text-xs text-white/50 hover:text-white transition-colors px-1"
          >
            Expand
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 min-h-[36px] px-3 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 active:bg-violet-600/40 border border-violet-500/30 text-violet-300 text-xs font-medium transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-w-full max-h-full"
            style={{ maxWidth: "min(90vw, 1024px)", maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={url}
              alt={`Generated image ${index + 1}`}
              className="rounded-xl object-contain w-full h-full"
              style={{ maxHeight: "80vh" }}
            />
            <div className="mt-3 flex justify-center">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 h-11 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-sm font-medium transition-all"
              >
                <Download className="h-4 w-4" />
                Download Image
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Prompt history pill ──────────────────────────────── */
function PromptPill({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 max-w-[200px] truncate rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all text-left"
    >
      {text}
    </button>
  );
}

/* ── Main page ────────────────────────────────────────── */
export default function ImagesPage() {
  const { toast } = useToast();

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<ImageStyleKey>("REALISTIC");
  const [ratio, setRatio] = useState<ImageRatioKey>("SQUARE");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [showRevised, setShowRevised] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleGenerate = useCallback(async (overridePrompt?: string) => {
    const activePrompt = overridePrompt ?? prompt;
    if (!activePrompt.trim()) {
      toast({ title: "Prompt required", description: "Describe the image you want to create.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: activePrompt, style, ratio }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          toast({
            title: "Daily limit reached",
            description: `Free plan: ${FREE_DAILY_IMAGE_LIMIT} image generations/day. Upgrade to Pro for more.`,
            variant: "destructive",
          });
        } else {
          toast({ title: "Generation failed", description: data.error, variant: "destructive" });
        }
        return;
      }

      setResult(data);
      // Add to history (deduplicated)
      setPromptHistory((prev) => [
        activePrompt,
        ...prev.filter((p) => p !== activePrompt).slice(0, 9),
      ]);
    } catch {
      toast({ title: "Error", description: "Failed to generate images. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [prompt, style, ratio, toast]);

  const imageGridClass =
    ratio === "LANDSCAPE_16_9"
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-2";

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-violet-400" />
            AI Image Generator
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-0.5">
            Create stunning images with DALL-E 3
          </p>
        </div>
        <Link href="/images/history">
          <button className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 active:bg-white/15 text-white/60 hover:text-white text-xs transition-all">
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">History</span>
          </button>
        </Link>
      </div>

      {/* ── Form Card ── */}
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-5">

          {/* Prompt textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">
              Describe your image
              <span className="text-red-400 ml-0.5">*</span>
            </label>
            <Textarea
              placeholder="e.g. A Filipino nurse in white uniform holding a heart, golden hour lighting, cinematic..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              maxLength={1000}
              className="text-base resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/30">{prompt.length}/1000</span>
              {prompt.length > 0 && (
                <button
                  onClick={() => setPrompt("")}
                  className="text-[11px] text-white/40 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Prompt history pills */}
          {promptHistory.length > 0 && (
            <div>
              <p className="text-[11px] text-white/40 mb-2 uppercase tracking-wide font-medium">Recent prompts</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {promptHistory.map((p, i) => (
                  <PromptPill
                    key={i}
                    text={p}
                    onClick={() => { setPrompt(p); }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Style selector */}
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-white/80">Style</label>
            <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {(Object.keys(IMAGE_STYLES) as ImageStyleKey[]).map((key) => {
                const s = IMAGE_STYLES[key];
                const isActive = style === key;
                return (
                  <button
                    key={key}
                    onClick={() => setStyle(key)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all min-h-[64px] sm:min-h-[72px] ${
                      isActive
                        ? "border-violet-500/70 bg-violet-600/20 text-violet-300"
                        : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white active:bg-white/15"
                    }`}
                  >
                    <span className="text-xl sm:text-2xl leading-none">{s.emoji}</span>
                    <span className="text-[10px] sm:text-[11px] font-medium leading-tight text-center">
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-white/40">{IMAGE_STYLES[style].description}</p>
          </div>

          {/* Ratio selector */}
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-white/80">Image Ratio</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(IMAGE_RATIOS) as ImageRatioKey[]).map((key) => {
                const r = IMAGE_RATIOS[key];
                const isActive = ratio === key;
                return (
                  <button
                    key={key}
                    onClick={() => setRatio(key)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all min-h-[72px] ${
                      isActive
                        ? "border-violet-500/70 bg-violet-600/20 text-violet-300"
                        : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white active:bg-white/15"
                    }`}
                  >
                    <div className={isActive ? "text-violet-300" : "text-white/50"}>
                      <RatioBox ratio={key} />
                    </div>
                    <div className="text-center">
                      <div className="text-[11px] sm:text-xs font-semibold">{r.label}</div>
                      <div className="text-[10px] opacity-60">{r.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate button */}
          <Button
            className="w-full h-13 text-base gap-2.5"
            style={{ height: "52px" }}
            variant="gradient"
            onClick={() => handleGenerate()}
            disabled={loading || !prompt.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating 4 images...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate 4 Images
              </>
            )}
          </Button>

          {/* Limit notice */}
          <p className="text-center text-[11px] text-white/30">
            Free plan: {FREE_DAILY_IMAGE_LIMIT} generations/day · Pro: unlimited
          </p>
        </CardContent>
      </Card>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-4 w-4 rounded-full bg-violet-500/30 animate-pulse" />
            <p className="text-sm text-white/50 animate-pulse">
              Creating {ratio === "PORTRAIT_9_16" ? "vertical" : ratio === "LANDSCAPE_16_9" ? "widescreen" : "square"} images with {IMAGE_STYLES[style].label} style...
            </p>
          </div>
          <div className={`grid ${imageGridClass} gap-3`}>
            {Array.from({ length: 4 }).map((_, i) => {
              const aspectClass =
                ratio === "LANDSCAPE_16_9" ? "aspect-video"
                : ratio === "PORTRAIT_9_16" ? "aspect-[9/16]"
                : ratio === "PORTRAIT_4_5" ? "aspect-[4/5]"
                : "aspect-square";
              return (
                <div
                  key={i}
                  className={`w-full ${aspectClass} rounded-xl bg-white/5 animate-pulse border border-white/10 flex items-center justify-center`}
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <ImageIcon className="h-8 w-8 text-white/10" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {!loading && result && (
        <div className="space-y-4">
          {/* Result header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-white">
                {result.imageUrls.length} images generated
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                {IMAGE_STYLES[result.style].emoji} {IMAGE_STYLES[result.style].label}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {IMAGE_RATIOS[result.ratio].label}
              </Badge>
            </div>
          </div>

          {/* Image grid */}
          <div className={`grid ${imageGridClass} gap-3`}>
            {result.imageUrls.map((url, i) => (
              <ImageCard
                key={`${result.id}-${i}`}
                url={url}
                index={i}
                ratio={result.ratio}
                prompt={result.prompt}
              />
            ))}
          </div>

          {/* Action row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 h-11 gap-2"
              onClick={() => handleGenerate()}
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </Button>
            <Button
              variant="ghost"
              className="flex-1 h-11 gap-2 text-white/60"
              onClick={() => {
                setResult(null);
                setPrompt("");
              }}
            >
              <Wand2 className="h-4 w-4" />
              New Image
            </Button>
          </div>

          {/* Revised prompts toggle */}
          {result.revisedPrompts?.some(Boolean) && (
            <div>
              <button
                onClick={() => setShowRevised(!showRevised)}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                {showRevised ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showRevised ? "Hide" : "Show"} how DALL-E interpreted your prompt
              </button>
              {showRevised && (
                <div className="mt-2 space-y-2">
                  {result.revisedPrompts.filter(Boolean).slice(0, 1).map((rp, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-white/60 leading-relaxed">{rp}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !result && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-violet-400" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">Create with AI</h3>
          <p className="text-sm text-white/40 max-w-xs leading-relaxed">
            Describe any image and get 4 unique AI-generated variations using DALL-E 3.
          </p>

          {/* Example prompts */}
          <div className="mt-5 flex flex-col gap-2 w-full max-w-sm">
            <p className="text-[11px] text-white/30 uppercase tracking-wide font-medium">Try these</p>
            {[
              "OFW nurse smiling at camera, cinematic golden light",
              "Beautiful house in the Philippines for sale, sunny day",
              "Filipino family celebrating birthday, warm colors",
              "Motivational sunrise over Manila skyline",
            ].map((example) => (
              <button
                key={example}
                onClick={() => setPrompt(example)}
                className="text-left text-xs text-white/50 hover:text-white/80 px-3 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 active:bg-white/15 transition-all min-h-[44px]"
              >
                &ldquo;{example}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
