import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap,
  Star,
  Check,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Globe,
  Heart,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";

const features = [
  { icon: Sparkles, title: "AI-Powered Generation", description: "Generate 5 unique viral captions instantly using GPT-4. Every variation is optimized for maximum engagement." },
  { icon: Globe, title: "Multi-Platform Support", description: "Tailored content for Facebook, TikTok, Instagram, and YouTube Shorts with platform-specific best practices." },
  { icon: Heart, title: "Filipino Creator Focus", description: "Native Tagalog and Taglish content generation for OFW posts, nurse appreciation, and Filipino community content." },
  { icon: TrendingUp, title: "Viral-Optimized Output", description: "Every caption includes a hook, body, hashtags, first comment, and CTA — the complete engagement formula." },
  { icon: Users, title: "11 Content Types", description: "From reel captions to giveaway posts, star sender shoutouts to real estate listings — all covered." },
  { icon: Clock, title: "Save & Organize", description: "Build your content library. Save, edit, search, and filter your generated captions anytime." },
];

const contentTypes = [
  "Reel Caption", "Viral Hook", "Hashtags", "First Comment",
  "Giveaway Post", "Star Sender Shoutout", "Funny Couple Caption",
  "Inspirational Post", "OFW Content", "Nurse Appreciation", "Real Estate Caption",
];

const testimonials = [
  { name: "Maria Santos", role: "Facebook Creator • 50K followers", content: "This tool changed my content game completely! My reels are getting 10x more views since I started using Viral Caption Studio.", rating: 5 },
  { name: "Juan dela Cruz", role: "Real Estate Agent • Facebook Marketer", content: "The real estate captions are incredibly professional. My listings get more inquiries now. Worth every peso!", rating: 5 },
  { name: "Nurse Ana Reyes", role: "OFW Nurse • Content Creator", content: "Finally a tool that understands Filipino creators! The Taglish content sounds so natural and gets amazing engagement.", rating: 5 },
];

const faqs = [
  { q: "How does the AI content generator work?", a: "Simply select your platform, content type, tone, and length, then describe your topic. Our AI generates 5 unique viral-optimized variations instantly using advanced GPT-4 technology." },
  { q: "Can it write in Tagalog or Taglish?", a: "Yes! We have dedicated Tagalog and Taglish tone options designed specifically for Filipino creators. The AI writes naturally like a Filipino content creator would speak." },
  { q: "What's the difference between Free and Pro?", a: "Free users get 10 generations per day. Pro users get unlimited generations, plus access to all templates, unlimited saved content, and priority support." },
  { q: "Can I cancel my subscription anytime?", a: "Absolutely. You can cancel your Pro subscription at any time from the Billing page. You'll retain access until the end of your billing period." },
  { q: "Is my content unique and safe to use?", a: "Yes! Every generation produces unique content. The AI is instructed to avoid offensive, misleading, or harmful content to keep your brand safe." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-gray-950 to-purple-900/20" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 sm:w-96 lg:w-[600px] h-64 sm:h-96 lg:h-[600px] rounded-full bg-violet-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <Badge variant="default" className="mb-4 sm:mb-6 inline-flex gap-1.5 text-xs">
            <Sparkles className="h-3 w-3" />
            Powered by GPT-4 AI
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-4 sm:mb-6">
            Generate Viral
            <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Facebook Content
            </span>
            in Seconds
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            The AI content generator built for Filipino Facebook creators. Write viral captions,
            hooks, hashtags, giveaway posts, and more — in Tagalog, Taglish, or English.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-12 px-2 sm:px-0">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="gradient" className="w-full sm:w-auto h-12 sm:h-14 text-base gap-2 px-6 sm:px-8">
                Start Generating Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-14 text-base px-6 sm:px-8">
                See Features
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            {[
              { label: "Content Types", value: "11+" },
              { label: "Platforms", value: "4" },
              { label: "Tones Available", value: "8" },
              { label: "Variations / Generate", value: "5" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-[11px] sm:text-xs text-white/40 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Types Chips */}
      <section className="py-6 sm:py-8 border-y border-white/5 overflow-hidden px-4">
        <div className="flex gap-2 flex-wrap justify-center max-w-3xl mx-auto">
          {contentTypes.map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60"
            >
              <Zap className="h-2.5 w-2.5 text-violet-400 shrink-0" />
              {type}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-20 lg:py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <Badge variant="default" className="mb-3 sm:mb-4">Features</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
              Everything You Need to Go Viral
            </h2>
            <p className="text-sm sm:text-base text-white/50 max-w-xl mx-auto px-2">
              Built specifically for Facebook creators who want to grow their audience and engagement faster.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover:border-violet-500/30 transition-all">
                  <CardContent className="p-5 sm:p-6">
                    <div className="mb-3 sm:mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/20 border border-violet-500/30">
                      <Icon className="h-5 w-5 text-violet-400" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-white mb-1.5 sm:mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-20 lg:py-24 px-4 bg-white/[0.02]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <Badge variant="default" className="mb-3 sm:mb-4">Pricing</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-sm sm:text-base text-white/50">Start free, upgrade when you need more.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {/* Free */}
            <Card>
              <CardContent className="p-5 sm:p-6">
                <h3 className="font-semibold text-white mb-1">Free</h3>
                <div className="text-3xl font-bold text-white mb-1">$0</div>
                <p className="text-xs text-white/40 mb-5 sm:mb-6">forever</p>
                <ul className="space-y-2.5 mb-5 sm:mb-6">
                  {["10 generations/day", "All content types", "All platforms", "Save 50 captions", "Basic templates"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button variant="outline" className="w-full h-11">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="border-violet-500/50 bg-violet-600/10 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="pro" className="text-xs">Most Popular</Badge>
              </div>
              <CardContent className="p-5 sm:p-6">
                <h3 className="font-semibold text-white mb-1">Pro</h3>
                <div className="text-3xl font-bold text-white mb-1">$19</div>
                <p className="text-xs text-white/40 mb-5 sm:mb-6">per month</p>
                <ul className="space-y-2.5 mb-5 sm:mb-6">
                  {["Unlimited generations", "All content types", "All platforms", "Unlimited saved captions", "All templates", "Priority support"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button variant="gradient" className="w-full h-11">Start Pro Trial</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Creator Pro */}
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardContent className="p-5 sm:p-6">
                <h3 className="font-semibold text-white mb-1">Creator Pro</h3>
                <div className="text-3xl font-bold text-white mb-1">$49</div>
                <p className="text-xs text-white/40 mb-5 sm:mb-6">per month</p>
                <ul className="space-y-2.5 mb-5 sm:mb-6">
                  {["Everything in Pro", "Custom AI training", "Bulk generation", "Team collaboration", "API access", "Dedicated support"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button variant="outline" className="w-full h-11">Get Creator Pro</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 lg:py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <Badge variant="default" className="mb-3 sm:mb-4">Testimonials</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Loved by Filipino Creators
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <CardContent className="p-5 sm:p-6">
                  <div className="flex gap-0.5 mb-3 sm:mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed mb-3 sm:mb-4">&ldquo;{t.content}&rdquo;</p>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-20 lg:py-24 px-4 bg-white/[0.02]">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-10 sm:mb-12">
            <Badge variant="default" className="mb-3 sm:mb-4">FAQ</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Common Questions</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i}>
                <CardContent className="p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-start gap-2">
                    <ChevronDown className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                    {faq.q}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed pl-6">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 lg:py-24 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 to-purple-600/20 p-8 sm:p-10 lg:p-12">
            <Zap className="h-10 w-10 text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Ready to Go Viral?</h2>
            <p className="text-sm sm:text-base text-white/60 mb-6 sm:mb-8">
              Join thousands of Filipino creators already using Viral Caption Studio to grow their audience.
            </p>
            <Link href="/register">
              <Button size="lg" variant="gradient" className="w-full sm:w-auto h-12 sm:h-14 text-base gap-2 px-8">
                Start Generating Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="mt-4 text-xs text-white/30">No credit card required • 10 free generations per day</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 sm:py-8 px-4">
        <div className="mx-auto max-w-6xl flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-violet-600 to-purple-600">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-white/70">Viral Caption Studio</span>
          </div>
          <p className="text-xs text-white/30 text-center">© 2024 Viral Caption Studio. Built for Filipino creators.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
