export type BirdTier = "free" | "premium" | "legendary";

export type Bird = {
  slug: string;
  name: string;
  nameLatin: string;
  emoji: string;
  speedKmh: number;
  variancePct: number;
  failRate: number;
  tier: BirdTier;
  description: string;
};

export const BIRDS: Bird[] = [
  {
    slug: "common_pigeon",
    name: "Merpati Biasa",
    nameLatin: "Common Pigeon",
    emoji: "🐦",
    speedKmh: 80,
    variancePct: 0.2,
    failRate: 0.02,
    tier: "free",
    description: "Andalan setiap pengirim pesan — stabil dan bisa diandalkan.",
  },
  {
    slug: "eagle",
    name: "Elang",
    nameLatin: "Eagle",
    emoji: "🦅",
    speedKmh: 160,
    variancePct: 0.15,
    failRate: 0.01,
    tier: "free",
    description: "Cepat dan tangguh, jarang meleset dari jalur.",
  },
  {
    slug: "parrot",
    name: "Beo",
    nameLatin: "Parrot",
    emoji: "🦜",
    speedKmh: 60,
    variancePct: 0.3,
    failRate: 0.03,
    tier: "free",
    description: "Suka mampir — kecepatannya paling tidak terduga.",
  },
  {
    slug: "swan",
    name: "Angsa",
    nameLatin: "Swan",
    emoji: "🦢",
    speedKmh: 40,
    variancePct: 0.1,
    failRate: 0.005,
    tier: "premium",
    description: "Anggun dan hampir tak pernah gagal, walau tak secepat elang.",
  },
  {
    slug: "owl",
    name: "Hantu",
    nameLatin: "Owl",
    emoji: "🦉",
    speedKmh: 120,
    variancePct: 0.05,
    failRate: 0.008,
    tier: "premium",
    description: "Terbang paling presisi — kecepatannya nyaris konstan.",
  },
  {
    slug: "raven",
    name: "Gagak",
    nameLatin: "Raven",
    emoji: "🐦‍⬛",
    speedKmh: 100,
    variancePct: 0.25,
    failRate: 0.05,
    tier: "premium",
    description: "Misterius dan liar — hasilnya bisa mengejutkan.",
  },
  {
    slug: "dodo",
    name: "Dodo",
    nameLatin: "Extinct",
    emoji: "🦤",
    speedKmh: 20,
    variancePct: 0.5,
    failRate: 0.15,
    tier: "legendary",
    description: "Legendaris karena langka — mengirim lewat Dodo adalah taruhan.",
  },
  {
    slug: "golden_eagle",
    name: "Elang Emas",
    nameLatin: "Golden Eagle",
    emoji: "🦅",
    speedKmh: 200,
    variancePct: 0.1,
    failRate: 0.003,
    tier: "legendary",
    description: "Burung tercepat dan paling dapat diandalkan di Kabar Sayap.",
  },
];

export const TIER_LABEL: Record<BirdTier, string> = {
  free: "Gratis",
  premium: "Premium",
  legendary: "Legendaris",
};
