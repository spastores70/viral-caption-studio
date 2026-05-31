"use client";

import { useState, useEffect, useCallback } from "react";
import { Bookmark, Search, Trash2, Edit2, Copy, Check, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getPlatformLabel, getContentTypeLabel, formatDate } from "@/lib/utils";

interface SavedItem {
  id: string;
  platform: string;
  contentType: string;
  title: string;
  content: string;
  hashtags?: string;
  hook?: string;
  firstComment?: string;
  cta?: string;
  createdAt: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex h-10 w-10 items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

export default function SavedPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [editItem, setEditItem] = useState<SavedItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (platformFilter !== "ALL") params.set("platform", platformFilter);
    const res = await fetch(`/api/save-content?${params}`);
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }, [search, platformFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchSaved, 300);
    return () => clearTimeout(timer);
  }, [fetchSaved]);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/delete-content?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast({ title: "Deleted", description: "Caption removed from library." });
    }
    setDeleteId(null);
  };

  const handleEdit = async () => {
    if (!editItem) return;
    const res = await fetch(`/api/save-content`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editItem.id, content: editContent }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((item) => item.id === editItem.id ? { ...item, content: editContent } : item));
      toast({ title: "Updated", description: "Caption updated successfully." });
    }
    setEditItem(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Bookmark className="h-5 w-5 sm:h-6 sm:w-6 text-violet-400" />
          Saved Content
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-0.5">{items.length} saved captions</p>
      </div>

      {/* Search + filter row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          <Input
            placeholder="Search captions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 text-base"
            inputMode="search"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors shrink-0 ${
            platformFilter !== "ALL"
              ? "border-violet-500/50 bg-violet-600/20 text-violet-400"
              : "border-white/10 bg-white/5 text-white/50 hover:text-white"
          }`}
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Filter drawer */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-1.5">
              <Label>Filter by Platform</Label>
              <Select value={platformFilter} onValueChange={(v) => { setPlatformFilter(v); setShowFilters(false); }}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Platforms</SelectItem>
                  <SelectItem value="FACEBOOK">Facebook</SelectItem>
                  <SelectItem value="TIKTOK">TikTok</SelectItem>
                  <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                  <SelectItem value="YOUTUBE_SHORTS">YouTube Shorts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active filter badge */}
      {platformFilter !== "ALL" && (
        <div className="flex items-center gap-2">
          <Badge variant="default" className="gap-1 text-xs">
            {getPlatformLabel(platformFilter)}
            <button onClick={() => setPlatformFilter("ALL")} className="ml-1">
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        </div>
      )}

      {/* Content grid */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <Bookmark className="h-12 w-12 text-white/20 mb-4" />
          <h3 className="text-base font-semibold text-white mb-1">No saved captions</h3>
          <p className="text-sm text-white/40">
            {search ? "No results match your search." : "Generate content and save your favorites here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="hover:border-white/20 active:border-white/30 transition-all">
              <CardContent className="p-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <h3 className="text-sm font-semibold text-white line-clamp-2 flex-1 leading-snug">{item.title}</h3>
                  <div className="flex items-center shrink-0 -mr-1 -mt-1">
                    <CopyButton text={`${item.hook || ""}\n\n${item.content}\n\n${item.hashtags || ""}`} />
                    <button
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors"
                      onClick={() => { setEditItem(item); setEditContent(item.content); }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/10 active:bg-red-400/20 transition-colors"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex gap-1.5 mb-2.5 flex-wrap">
                  <Badge variant="secondary" className="text-[10px] h-5">{getPlatformLabel(item.platform)}</Badge>
                  <Badge variant="outline" className="text-[10px] h-5">{getContentTypeLabel(item.contentType)}</Badge>
                </div>

                {/* Preview */}
                {item.hook && (
                  <p className="text-xs font-medium text-violet-300 mb-1 line-clamp-1">{item.hook}</p>
                )}
                <p className="text-sm text-white/60 line-clamp-3 leading-relaxed">{item.content}</p>

                {item.hashtags && (
                  <p className="text-xs text-violet-400/70 mt-2 line-clamp-1">{item.hashtags}</p>
                )}

                <p className="text-[10px] text-white/25 mt-2.5">{formatDate(item.createdAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="mx-4 max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Caption</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Caption</Label>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
              className="text-base"
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="ghost" className="w-full sm:w-auto h-11" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button className="w-full sm:w-auto h-11" onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="mx-4 max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Caption</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/60">Are you sure you want to delete this caption? This cannot be undone.</p>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="ghost" className="w-full sm:w-auto h-11" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="w-full sm:w-auto h-11" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
