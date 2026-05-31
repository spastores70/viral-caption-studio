"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Wand2, Copy, Check, Bookmark, Loader2, ChevronDown, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="sm" className={`h-8 gap-1 text-xs min-w-[64px] ${className}`} onClick={handleCopy}>
      {copied ? <><Check className="h-3 w-3 text-emerald-400" /><span className="text-emerald-400">Copied!</span></> : <><Copy className="h-3 w-3" />Copy</>}
    </Button>
  );
}

function VariationCard({ variation, index, onSave }: { variation: ContentVariation; index: number; onSave: (v: ContentVariation) => void }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <Card className={index === 0 ? "border-violet-500/30" : ""}>
      <button
        className="flex items-center justify-between w-full px-4 py-3.5 text-left active:bg-white/5 transition-colors min-h-[44px]"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Badge variant={index === 0 ? "default" : "secondary"} className="shrink-0 text-[10px]">
            {index === 0 ? "Best" : `#${index + 1}`}
          </Badge>
          <span className="text-sm text-white/70 line-clamp-1 min-w-0">{variation.hook}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            className="flex items-center gap-1 text-xs text-white/50 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 min-h-[32px]"
            onClick={(e) => { e.stopPropagation(); onSave(variation); }}
          >
            <Bookmark className="h-3 w-3" />
            <span className="hidden sm:inline">Save</span>
          </button>
          <ChevronDown className={`h-4 w-4 text-white/40 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded && (
        <CardContent className="pt-0 pb-4 px-4 space-y-4">
          <div className="h-px bg-white/10" />
          {[
            { label: "Hook", color: "text-violet-400", value: variation.hook },
            { label: "Caption", color: "text-emerald-400", value: variation.caption },
            { label: "Hashtags", color: "text-blue-400", value: variation.hashtags },
            { label: "First Comment", color: "text-amber-400", value: variation.firstComment },
            { label: "Call to Action", color: "text-pink-400", value: variation.cta },
          ].map(({ label, color, value }) => (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${color}`}>{label}</span>
                <CopyButton text={value} />
              </div>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap break-words">{value}</p>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2 border-t border-white/10 flex-wrap gap-2">
            <CopyButton text={`${variation.hook}\n\n${variation.caption}\n\n${variation.hashtags}\n\nFirst Comment: ${variation.firstComment}`} />
            <Button size="sm" className="h-8 text-xs gap-1" onClick={() => onSave(variation)}>
              <Bookmark className="h-3 w-3" />Save to Library
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function GeneratorInner() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState<ContentVariation[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [form, setForm] = useState({
    platform: searchParams.get("platform") || "FACEBOOK",
    contentType: searchParams.get("type") || "REEL_CAPTION",
    tone: searchParams.get("tone") || "VIRAL",
    length: searchParams.get("length") || "MEDIUM",
    topic: searchParams.get("topic") || "",
    audience: searchParams.get("audience") || "",
    extraDetails: "",
  });

  const handleGenerate = async () => {
    if (!form.topic.trim()) {
      toast({ title: "Topic required", description: "Please enter a topic.", variant: "destructive" });
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
        toast({ title: res.status === 429 ? "Daily limit reached" : "Generation failed", description: data.error, variant: "destructive" });
        return;
      }
      setVariations(data.variations);
      setShowForm(false); // On mobile, switch to results view
    } catch {
      toast({ title: "Error", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (variation: ContentVariation) => {
    try {
      await fetch("/api/save-content", {
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
      toast({ title: "Saved!", description: "Caption saved to your library." });
    } catch {
      toast({ title: "Error", description: "Failed to save.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Wand2 className="h-5 w-5 sm:h-6 sm:w-6 text-violet-400" />
            AI Generator
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-0.5">Generate 5 viral variations instantly</p>
        </div>
        {/* Mobile toggle between form and results */}
        {variations.length > 0 && (
          <div className="flex lg:hidden gap-1 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setShowForm(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[36px] ${showForm ? "bg-white/10 text-white" : "text-white/50"}`}
            >
              Form
            </button>
            <button
              onClick={() => setShowForm(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[36px] ${!showForm ? "bg-white/10 text-white" : "text-white/50"}`}
            >
              Results (5)
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
        {/* Form — visible on mobile based on toggle, always visible on lg */}
        <div className={`lg:col-span-2 space-y-4 ${!showForm && variations.length > 0 ? "hidden lg:flex lg:flex-col" : ""}`}>
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base">Content Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5">
                <Label>Platform</Label>
                <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>{platforms.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Content Type</Label>
                <Select value={form.contentType} onValueChange={(v) => setForm({ ...form, contentType: v })}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>{contentTypes.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Tone</Label>
                  <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v })}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>{tones.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Length</Label>
                  <Select value={form.length} onValueChange={(v) => setForm({ ...form, length: v })}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>{lengths.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base">Content Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="topic">Topic <span className="text-red-400">*</span></Label>
                <Input
                  id="topic"
                  placeholder="e.g. Morning workout motivation..."
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="h-11 text-base"
                  maxLength={200}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="audience">Target Audience <span className="text-white/30 text-xs font-normal">(optional)</span></Label>
                <Input
                  id="audience"
                  placeholder="e.g. Filipino moms, OFW workers..."
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  className="h-11 text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="extra">Extra Details <span className="text-white/30 text-xs font-normal">(optional)</span></Label>
                <Textarea
                  id="extra"
                  placeholder="Any specific details or context..."
                  value={form.extraDetails}
                  onChange={(e) => setForm({ ...form, extraDetails: e.target.value })}
                  rows={3}
                  maxLength={500}
                />
              </div>

              <Button
                className="w-full h-12 gap-2 text-base"
                variant="gradient"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <><Zap className="h-4 w-4" />Generate 5 Variations</>}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results — visible on mobile based on toggle, always visible on lg */}
        <div className={`lg:col-span-3 space-y-3 sm:space-y-4 ${showForm && variations.length > 0 ? "hidden lg:flex lg:flex-col" : ""}`}>
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20">
              <div className="relative mb-4">
                <div className="h-14 w-14 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                <Wand2 className="absolute inset-0 m-auto h-5 w-5 text-violet-400" />
              </div>
              <p className="text-white/60 text-sm">Generating viral content...</p>
              <p className="text-white/30 text-xs mt-1">5–10 seconds</p>
            </div>
          )}

          {!loading && variations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
              <div className="h-14 w-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mb-4">
                <Wand2 className="h-7 w-7 text-violet-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Ready to Generate</h3>
              <p className="text-sm text-white/40 max-w-xs">
                Fill in your topic and tap Generate to create 5 unique viral variations.
              </p>
            </div>
          )}

          {!loading && variations.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-semibold text-white">5 Variations</h2>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={handleGenerate}>
                  <RefreshCw className="h-3 w-3" />Regenerate
                </Button>
              </div>
              <div className="space-y-3">
                {variations.map((v, i) => (
                  <VariationCard key={i} variation={v} index={i} onSave={handleSave} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GeneratorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-violet-400" /></div>}>
      <GeneratorInner />
    </Suspense>
  );
}
