"use client";

import { useState, useEffect, useCallback } from "react";
import { Bookmark, Search, Trash2, Edit2, Copy, Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
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
      setItems((prev) =>
        prev.map((item) =>
          item.id === editItem.id ? { ...item, content: editContent } : item
        )
      );
      toast({ title: "Updated", description: "Caption updated successfully." });
    }
    setEditItem(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-violet-400" />
          Saved Content
        </h1>
        <p className="text-sm text-white/50 mt-0.5">{items.length} saved captions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            placeholder="Search captions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="h-3.5 w-3.5 mr-1.5 opacity-50" />
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

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bookmark className="h-12 w-12 text-white/20 mb-4" />
          <h3 className="text-base font-semibold text-white mb-1">No saved captions</h3>
          <p className="text-sm text-white/40">
            {search ? "No results match your search." : "Generate content and save your favorites here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="hover:border-white/20 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-white line-clamp-1 flex-1">{item.title}</h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <CopyButton text={`${item.hook || ""}\n\n${item.content}\n\n${item.hashtags || ""}`} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => { setEditItem(item); setEditContent(item.content); }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400/70 hover:text-red-400"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-1.5 mb-3">
                  <Badge variant="secondary" className="text-[10px]">{getPlatformLabel(item.platform)}</Badge>
                  <Badge variant="outline" className="text-[10px]">{getContentTypeLabel(item.contentType)}</Badge>
                </div>

                {item.hook && (
                  <p className="text-xs font-medium text-violet-300 mb-1 line-clamp-1">{item.hook}</p>
                )}
                <p className="text-sm text-white/60 line-clamp-3 leading-relaxed">{item.content}</p>

                {item.hashtags && (
                  <p className="text-xs text-violet-400/70 mt-2 line-clamp-1">{item.hashtags}</p>
                )}

                <p className="text-xs text-white/30 mt-3">{formatDate(item.createdAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Caption</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Caption</Label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Caption</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/60">Are you sure you want to delete this caption? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
