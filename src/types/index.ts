export interface ContentVariation {
  hook: string;
  caption: string;
  hashtags: string;
  firstComment: string;
  cta: string;
}

export interface GenerateResponse {
  variations: ContentVariation[];
  generationId: string;
}

export interface UsageStats {
  used: number;
  limit: number;
  isUnlimited: boolean;
  remaining: number;
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "FREE" | "PRO" | "ADMIN";
  subscription?: {
    plan: "FREE" | "PRO" | "CREATOR_PRO";
    status: string;
    currentPeriodEnd?: Date;
  };
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

