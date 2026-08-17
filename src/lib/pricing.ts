export type CoinPackage = {
  id: string;
  coins: number;
  priceIdr: number;
  bonus?: string;
};

export const COIN_PACKAGES: CoinPackage[] = [
  { id: "small", coins: 100, priceIdr: 10_000 },
  { id: "medium", coins: 550, priceIdr: 50_000, bonus: "+10% bonus" },
  { id: "large", coins: 1200, priceIdr: 100_000, bonus: "+20% bonus" },
];

export type PremiumPlan = {
  id: string;
  label: string;
  days: number;
  priceIdr: number;
};

export const PREMIUM_PLANS: PremiumPlan[] = [
  { id: "monthly", label: "1 Bulan", days: 30, priceIdr: 29_000 },
  { id: "yearly", label: "1 Tahun", days: 365, priceIdr: 249_000 },
];
