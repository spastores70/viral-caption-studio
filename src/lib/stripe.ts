import Stripe from "stripe";

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, {
    apiVersion: "2026-05-27.dahlia",
    typescript: true,
  });
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

export const PLANS = {
  FREE: {
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    priceId: null,
    features: [
      "10 generations per day",
      "All content types",
      "All platforms",
      "Save up to 50 captions",
      "Basic templates",
    ],
    limits: {
      dailyGenerations: 10,
      savedContent: 50,
    },
  },
  PRO: {
    name: "Pro",
    description: "For serious content creators",
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "Unlimited generations",
      "All content types",
      "All platforms",
      "Unlimited saved captions",
      "All templates",
      "Priority support",
      "Export content",
    ],
    limits: {
      dailyGenerations: -1,
      savedContent: -1,
    },
  },
  CREATOR_PRO: {
    name: "Creator Pro",
    description: "For power creators and agencies",
    price: 49,
    priceId: process.env.STRIPE_CREATOR_PRO_PRICE_ID,
    features: [
      "Everything in Pro",
      "Custom AI training",
      "Bulk generation",
      "Team collaboration",
      "API access",
      "White-label exports",
      "Dedicated support",
    ],
    limits: {
      dailyGenerations: -1,
      savedContent: -1,
    },
  },
};

