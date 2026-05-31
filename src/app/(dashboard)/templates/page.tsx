import Link from "next/link";
import { FileText, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const templates = [
  { name: "Facebook Reel Caption", description: "Viral reel captions that stop the scroll", platform: "FACEBOOK", contentType: "REEL_CAPTION", tone: "VIRAL", length: "MEDIUM", topic: "My latest video reel", audience: "Facebook users", icon: "🎬", tag: "Popular" },
  { name: "Funny Couple Caption", description: "Hilarious husband and wife moments for massive shares", platform: "FACEBOOK", contentType: "FUNNY_COUPLE_CAPTION", tone: "FUNNY", length: "SHORT", topic: "Funny married life moments", audience: "Married couples and parents", icon: "💑", tag: "Trending" },
  { name: "Star Sender Shoutout", description: "Heartfelt thank-you for your Facebook star senders", platform: "FACEBOOK", contentType: "STAR_SENDER_SHOUTOUT", tone: "EMOTIONAL", length: "SHORT", topic: "Thank you to my star senders", audience: "Facebook live viewers", icon: "⭐", tag: "Creator" },
  { name: "Giveaway Announcement", description: "Exciting giveaway posts that drive massive engagement", platform: "FACEBOOK", contentType: "GIVEAWAY_POST", tone: "FRIENDLY", length: "MEDIUM", topic: "Product giveaway for followers", audience: "Filipino Facebook community", icon: "🎁", tag: "Engagement" },
  { name: "Nurse Appreciation Post", description: "Touching posts celebrating nurses and healthcare heroes", platform: "FACEBOOK", contentType: "NURSE_APPRECIATION", tone: "INSPIRATIONAL", length: "MEDIUM", topic: "Nurse heroes and their dedication", audience: "Healthcare community", icon: "👩‍⚕️", tag: "Healthcare" },
  { name: "Real Estate Caption", description: "Professional captions for property listings", platform: "FACEBOOK", contentType: "REAL_ESTATE_CAPTION", tone: "PROFESSIONAL", length: "MEDIUM", topic: "Beautiful home for sale", audience: "Home buyers and investors", icon: "🏠", tag: "Business" },
  { name: "Motivational Post", description: "Daily inspiration that gets saved and shared widely", platform: "FACEBOOK", contentType: "INSPIRATIONAL_POST", tone: "INSPIRATIONAL", length: "SHORT", topic: "Monday motivation and success mindset", audience: "General Filipino audience", icon: "💪", tag: "Inspiration" },
  { name: "Viral Question Post", description: "Thought-provoking questions that flood your comments", platform: "FACEBOOK", contentType: "VIRAL_HOOK", tone: "VIRAL", length: "SHORT", topic: "Relatable life questions", audience: "Filipino Facebook community", icon: "🤔", tag: "Viral" },
  { name: "OFW Content", description: "Heartfelt content connecting OFW workers with families", platform: "FACEBOOK", contentType: "OFW_CONTENT", tone: "EMOTIONAL", length: "MEDIUM", topic: "Life as an OFW and missing home", audience: "OFW workers and their families", icon: "✈️", tag: "OFW" },
];

const tagColors: Record<string, any> = {
  Popular: "default", Trending: "pro", Creator: "warning",
  Engagement: "success", Healthcare: "success", Business: "secondary",
  Inspiration: "default", Viral: "pro", OFW: "warning",
};

export default function TemplatesPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-violet-400" />
          Templates
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-0.5">
          Tap a template to instantly generate content
        </p>
      </div>

      {/* Template grid — 1 col on mobile, 2 on md, 3 on lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {templates.map((template) => (
          <Link
            key={template.name}
            href={`/generator?platform=${template.platform}&type=${template.contentType}&tone=${template.tone}&length=${template.length}&topic=${encodeURIComponent(template.topic)}&audience=${encodeURIComponent(template.audience || "")}`}
            className="block"
          >
            <Card className="h-full hover:border-violet-500/30 active:border-violet-500/50 active:scale-[0.99] transition-all cursor-pointer">
              <CardContent className="p-4 sm:p-5 flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl sm:text-3xl">{template.icon}</span>
                  <Badge variant={tagColors[template.tag] || "secondary"} className="text-[10px]">
                    {template.tag}
                  </Badge>
                </div>

                <h3 className="text-sm font-semibold text-white mb-1 leading-snug">{template.name}</h3>
                <p className="text-xs text-white/50 leading-relaxed flex-1 mb-4">{template.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {template.platform === "FACEBOOK" ? "FB" : template.platform}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] h-5">{template.tone}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-violet-400">
                    <Zap className="h-3 w-3" />
                    <span className="text-xs font-medium">Use</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
