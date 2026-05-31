"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { History, ImageIcon, Download, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { IMAGE_STYLES, IMAGE_RATIOS } from "@/lib/image-styles";
import type { ImageStyleKey, ImageRatioKey } from "@/lib/image-styles";
import { formatDate } from "@/lib/utils";

interface ImageRecord {
  id: string;
  prompt: string;
  style: ImageStyleKey;
  ratio: ImageRatioKey;
  imageUrls: string[];
  createdAt: string;
}

export default function ImageHistoryPage() {
  const { toast } = useToast();
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHistory = async (p = 1) => {
    setLoading(true);
    const res = await fetch(`/api/image-history?page=${p}`);
    const data = await res.json();
    if (p === 1) {
      setImages(data.images || []);
    } else {
      setImages((prev) => [...prev, ...(data.images || [])]);
    }
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => { fetchHistory(1); }, []);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/image-history?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== id));
      setTotal((t) => t - 1);
      toast({ title: "Deleted", description: "Image generation removed from history." });
    }
    setDeleteId(null);
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `viral-image-${index + 1}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      window.open(url, "_blank");
    }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchHistory(next);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/images">
          <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <History className="h-5 w-5 sm:h-6 sm:w-6 text-violet-400" />
            Image History
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-0.5">{total} total generations</p>
        </div>
      </div>

      {/* Content */}
      {loading && images.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-violet-400" />
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ImageIcon className="h-12 w-12 text-white/20 mb-4" />
          <h3 className="text-base font-semibold text-white mb-1">No image history yet</h3>
          <p className="text-sm text-white/40 mb-4">Start generating images to see them here.</p>
          <Link href="/images">
            <Button variant="default" size="sm">Generate Images</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {images.map((record) => (
            <Card key={record.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 p-3 sm:p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white line-clamp-2 leading-snug">
                      {record.prompt}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] h-4">
                        {IMAGE_STYLES[record.style]?.emoji} {IMAGE_STYLES[record.style]?.label}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] h-4">
                        {IMAGE_RATIOS[record.ratio]?.label}
                      </Badge>
                      <span className="text-[10px] text-white/30">
                        {formatDate(record.createdAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/10 active:bg-red-400/20 transition-colors shrink-0"
                    onClick={() => setDeleteId(record.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Image thumbnails — horizontal scroll on mobile */}
                <div
                  className="flex gap-2 px-3 sm:px-4 pb-3 overflow-x-auto scrollbar-none"
                  style={{ scrollSnapType: "x mandatory" }}
                >
                  {(record.imageUrls as string[]).map((url, i) => {
                    const aspectClass =
                      record.ratio === "LANDSCAPE_16_9" ? "aspect-video min-w-[240px]"
                      : record.ratio === "PORTRAIT_9_16" ? "aspect-[9/16] min-w-[100px]"
                      : record.ratio === "PORTRAIT_4_5" ? "aspect-[4/5] min-w-[120px]"
                      : "aspect-square min-w-[120px]";

                    return (
                      <div
                        key={i}
                        className={`relative ${aspectClass} rounded-lg overflow-hidden flex-shrink-0 border border-white/10 cursor-pointer group`}
                        style={{ scrollSnapAlign: "start", height: "120px", width: "auto" }}
                        onClick={() => setExpandedId(`${record.id}-${i}`)}
                      >
                        <Image
                          src={url}
                          alt={`Image ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="120px"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end justify-end p-1 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownload(url, i); }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white hover:bg-black/80"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Re-use prompt */}
                <div className="px-3 sm:px-4 pb-3">
                  <Link href={`/images?prompt=${encodeURIComponent(record.prompt)}&style=${record.style}&ratio=${record.ratio}`}>
                    <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                      ↺ Use this prompt again
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Load more */}
          {images.length < total && (
            <Button
              variant="outline"
              className="w-full h-11"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Load more ({total - images.length} remaining)
            </Button>
          )}
        </div>
      )}

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="mx-4 max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Generation</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/60">
            Remove this image generation from your history? This cannot be undone.
          </p>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="ghost" className="w-full sm:w-auto h-11" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="w-full sm:w-auto h-11" onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
