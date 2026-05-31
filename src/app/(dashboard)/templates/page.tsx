import Link from "next/link";
import { FileText, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const templates = [
  {
    name: "Facebook Reel Caption Generator",
    description: "Viral reel captions with hooks that stop the scroll",
    platform: "FACEBOOK",
    contentType: "REEL_CAPTION",
    tone: "VIRAL",
    length: "MEDIUM",
    topic: "My latest video reel",
    audience: "Facebook users",
    icon: "🎬",
    tag: "Popular",
  },
  {
    name: "Funny Couple Caption Generator",
    description: "Hilarious husband and wife moments that get tons of shares",
    platform: "FACEBOOK",
    contentType: "FUNNY_COUPLE_CAPTION",
    tone: "FUNNY",
    length: "SHORT",
    topic: "Funny married life moments",
    audience: "Married couples and parents",
    icon: "💑",
    tag: "Trending",
  },
  {
    name: "Star Sender Thank You Generator",
    description: "Heartfelt shoutouts for your Facebook star senders",
    platform: "FACEBOOK",
    contentType: "STAR_SENDER_SHOUTOUT",
    tone: "EMOTIONAL",
    length: "SHORT",
    topic: "Thank you to my star senders",
    audience: "Facebook live viewers",
    icon: "⭐",
    tag: "Creator",
  },
  {
    name: "Giveaway Announcement Generator",
    description: "Exciting giveaway posts that drive massive engagement",
    platform: "FACEBOOK",
    contentType: "GIVEAWAY_POST",
    tone: "FRIENDLY",
    length: "MEDIUM",
    topic: "Product giveaway for followers",
    audience: "Filipino Facebook community",
    icon: "🎁",
    tag: "Engagement",
  },
  {
    name: "Nurse Appreciation Generator",
    description: "Touching posts celebrating nurses and healthcare heroes",
    platform: "FACEBOOK",
    contentType: "NURSE_APPRECIATION",
    tone: "INSPIRATIONAL",
    length: "MEDIUM",
    topic: "Nurse heroes and their dedication",
    audience: "Healthcare community",
    icon: "👩‍⚕️",
    tag: "Healthcare",
  },
  {
    name: "Real Estate Caption Generator",
    description: "Professional captions for property listings and open houses",
    platform: "FACEBOOK",
    contentType: "REAL_ESTATE_CAPTION",
    tone: "PROFESSIONAL",
    length: "MEDIUM",
    topic: "Beautiful home for sale",
    audience: "Home buyers and investors",
    icon: "🏠",
    tag: "Business",
  },
  {
    name: "Motivational Post Generator",
    description: "Daily inspiration that gets saved and shared widely",
    platform: "FACEBOOK",
    contentType: "INSPIRATIONAL_POST",
    tone: "INSPIRATIONAL",
    length: "SHORT",
    topic: "Monday motivation and success mindset",
    audience: "General Filipino audience",
    icon: "💪",
    tag: "Inspiration",
  },
  {
    name: "Viral Question Post Generator",
    description: "Thought-provoking questions that flood your comments",
    platform: "FACEBOOK",
    contentType: "VIRAL_HOOK",
    tone: "VIRAL",
    length: "SHORT",
    topic: "Relatable life questions and observations",
    audience: "Filipino Facebook community",
    icon: "🤔",
    tag: "Viral",
  },
  {
    name: "OFW Content Generator",
    description: "Heartfelt content connecting OFW workers with their families",
    platform: "FACEBOOK",
    contentType: "OFW_CONTENT",
    tone: "EMOTIONAL",
    length: "MEDIUM",
    topic: "Life as an OFW and missing home",
    audience: "OFW workers and their families",
    icon: "✈️",
    tag: "OFW",
  },
];

const tagColors: Record<string, string> = {
  Popular: "default",
  Trending: "pro",
  Creator: "warning",
  Engagement: "success",
  Healthcare: "success",
  Business: "secondary",
  Inspiration: "default",
  Viral: "pro",
  OFW: "warning",
};

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-violet-400" />
          Templates
        </h1>
        <p className="text-sm text-white/50 mt-0.5">
          Ready-made prompts for the most popular content types
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card
            key={template.name}
            className="group hover:border-violet-500/30 transition-all"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl">{template.icon}</div>
                <Badge
                  variant={(tagColors[template.tag] as any) || "secondary"}
                  className="text-[10px]"
                >
                  {template.tag}
                </Badge>
              </div>

              <h3 className="text-sm font-semibold text-white mb-1.5">{template.name}</h3>
              <p className="text-xs text-white/50 leading-relaxed mb-4">{template.description}</p>

              <div className="flex gap-1.5 mb-4">
                <Badge variant="secondary" className="text-[10px]">
                  {template.platform === "FACEBOOK" ? "Facebook" : template.platform}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {template.tone}
                </Badge>
              </div>

              <Link
                href={`/generator?platform=${template.platform}&type=${template.contentType}&tone=${template.tone}&length=${template.length}&topic=${encodeURIComponent(template.topic)}&audience=${encodeURIComponent(template.audience || "")}`}
              >
                <Button
                  size="sm"
                  className="w-full gap-2 h-8 text-xs group-hover:gap-3 transition-all"
                >
                  <Zap className="h-3 w-3" />
                  Use Template
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-1 transition-all" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
