"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Wand2,
  Copy,
  Check,
  Bookmark,
  Loader2,
  ChevronDown,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { ContentVariation } from "@/types";

const platforms = [
  { value: "FACEBOOK", label: "Facebook" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "YOUTUBE_SHORTS", label: "YouTube Shorts" },
];

const contentTypes = [
  { value: "REEL_CAPTION", label: "Reel Caption" },
  { value: "VIRAL_HOOK", label: "Viral Hook" },
  { value: "HASHTAGS", label: "Hashtags" },
  { value: "FIRST_COMMENT", label: "First Comment" },
  { value: "GIVEAWAY_POST", label: "Giveaway Post" },
  { value: "STAR_SENDER_SHOUTOUT", label: "Star Sender Shoutout" },
  { value: "FUNNY_COUPLE_CAPTION", label: "Funny Couple Caption" },
  { value: "INSPIRATIONAL_POST", label: "Inspirational Post" },
  { value: "OFW_CONTENT", label: "OFW Content" },
  { value: "NURSE_APPRECIATION", label: "Nurse Appreciation" },
  { value: "REAL_ESTATE_CAPTION", label: "Real Estate Caption" },
];

const tones = [
  { value: "FUNNY", label: "Funny" },
  { value: "INSPIRATIONAL", label: "Inspirational" },
  { value: "EMOTIONAL", label: "Emotional" },
  { value: "FRIENDLY", label: "Friendly" },
  { value: "PROFESSIONAL", label: "Professional" },
  { value: "TAGALOG", label: "Tagalog" },
  { value: "TAGLISH", label: "Taglish" },
  { value: "VIRAL", label: "Viral" },
];

const lengths = [
  { value: "SHORT", label: "Short" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LONG", label: "Long" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1 text-xs"
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-400" />
          <span className="text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          Copy
        </>
      )}
    </Button>
  );
}

function VariationCard({
  variation,
  index,
  onSave,
  platform,
  contentType,
}: {
  variation: ContentVariation;
  index: number;
  onSave: (variation: ContentVariation) => void;
  platform: string;
  contentType: string;
}) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <Card className={`transition-all ${index === 0 ? "border-violet-500/30" : ""}`}>
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/2 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs">
            {index === 0 ? "Best" : `#${index + 1}`}
          </Badge>
          <span className="text-sm text-white/70 line-clamp-1 max-w-xs">
            {variation.hook}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onSave(variation);
            }}
          >
            <Bookmark className="h-3 w-3" />
            Save
          </Button>
          <ChevronDown
            className={`h-4 w-4 text-white/40 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {expanded && (
        <CardContent className="pt-0 pb-4 px-4 space-y-4">
          <div className="h-px bg-white/10" />

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-violet-400 uppercase tracking-wide">Hook</span>
              <CopyButton text={variation.hook} />
            </div>
            <p className="text-sm text-white/80 leading-relaxed">{variation.hook}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">Caption</span>
              <CopyButton text={variation.caption} />
            </div>
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{variation.caption}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-400 uppercase tracking-wide">Hashtags</span>
              <CopyButton text={variation.hashtags} />
            </div>
            <p className="text-sm text-violet-300/80">{variation.hashtags}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-400 uppercase tracking-wide">First Comment</span>
              <CopyButton text={variation.firstComment} />
            </div>
            <p className="text-sm text-white/80 leading-relaxed">{variation.firstComment}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-pink-400 uppercase tracking-wide">Call to Action</span>
              <CopyButton text={variation.cta} />
            </div>
            <p className="text-sm text-white/80">{variation.cta}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <CopyButton
              text={`${variation.hook}\n\n${variation.caption}\n\n${variation.hashtags}\n\nFirst Comment: ${variation.firstComment}`}
            />
            <Button
              variant="default"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => onSave(variation)}
            >
              <Bookmark className="h-3 w-3" />
              Save to Library
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function GeneratorPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState<ContentVariation[]>([]);
  const [generationId, setGenerationId] = useState<string>("");

  const [form, setForm] = useState({
    platform: searchParams.get("platform") || "FACEBOOK",
    contentType: searchParams.get("type") || "REEL_CAPTION",
    tone: "VIRAL",
    length: "MEDIUM",
    topic: "",
    audience: "",
    extraDetails: "",
  });

  const handleGenerate = async () => {
    if (!form.topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for your content.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setVariations([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          toast({
            title: "Daily limit reached",
            description: "Upgrade to Pro for unlimited generations.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Generation failed",
            description: data.error || "Something went wrong.",
            variant: "destructive",
          });
        }
        return;
      }

      setVariations(data.variations);
      setGenerationId(data.generationId);
    } catch {
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (variation: ContentVariation) => {
    try {
      const res = await fetch("/api/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: form.platform,
          contentType: form.contentType,
          title: variation.hook.slice(0, 100),
          content: variation.caption,
          hashtags: variation.hashtags,
          hook: variation.hook,
          firstComment: variation.firstComment,
          cta: variation.cta,
        }),
      });

      if (res.ok) {
        toast({
          title: "Saved!",
          description: "Caption saved to your library.",
          variant: "default",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to save caption.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-violet-400" />
          AI Content Generator
        </h1>
        <p className="text-sm text-white/50 mt-0.5">
          Generate 5 viral caption variations instantly
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Content Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Platform</Label>
                <Select
                  value={form.platform}
                  onValueChange={(v) => setForm({ ...form, platform: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Content Type</Label>
                <Select
                  value={form.contentType}
                  onValueChange={(v) => setForm({ ...form, contentType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Tone</Label>
                  <Select
                    value={form.tone}
                    onValueChange={(v) => setForm({ ...form, tone: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Length</Label>
                  <Select
                    value={form.length}
                    onValueChange={(v) => setForm({ ...form, length: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lengths.map((l) => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Content Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="topic">
                  Topic <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="topic"
                  placeholder="e.g. Morning workout motivation, House for sale in Quezon City..."
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  maxLength={200}
                />
                <p className="text-xs text-white/30 text-right">{form.topic.length}/200</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="audience">Target Audience (optional)</Label>
                <Input
                  id="audience"
                  placeholder="e.g. Filipino moms, OFW workers, fitness lovers..."
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="extra">Extra Details (optional)</Label>
                <Textarea
                  id="extra"
                  placeholder="Any specific details, keywords, or context to include..."
                  value={form.extraDetails}
                  onChange={(e) => setForm({ ...form, extraDetails: e.target.value })}
                  rows={3}
                  maxLength={500}
                />
              </div>

              <Button
                className="w-full gap-2"
                variant="gradient"
                size="lg"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Generate 5 Variations
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                <Wand2 className="absolute inset-0 m-auto h-6 w-6 text-violet-400" />
              </div>
              <p className="text-white/60 mt-4 text-sm">Generating viral content...</p>
              <p className="text-white/30 text-xs mt-1">This usually takes 5-10 seconds</p>
            </div>
          )}

          {!loading && variations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mb-4">
                <Wand2 className="h-8 w-8 text-violet-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Ready to Generate</h3>
              <p className="text-sm text-white/40 max-w-xs">
                Fill in the settings on the left and click Generate to create 5 unique viral variations.
              </p>
            </div>
          )}

          {!loading && variations.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">
                  5 Variations Generated
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={handleGenerate}
                >
                  <RefreshCw className="h-3 w-3" />
                  Regenerate
                </Button>
              </div>

              <div className="space-y-3">
                {variations.map((variation, i) => (
                  <VariationCard
                    key={i}
                    variation={variation}
                    index={i}
                    onSave={handleSave}
                    platform={form.platform}
                    contentType={form.contentType}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
