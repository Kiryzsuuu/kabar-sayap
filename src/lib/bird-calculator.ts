import { haversineKm, type LatLng } from "./geo";

export type BirdStats = {
  speedKmh: number;
  variancePct: number;
  failRate: number;
};

export type DeliveryPlan = {
  distanceKm: number;
  speedActualKmh: number;
  durationSec: number;
  estimatedEta: Date;
  willFail: boolean;
};

/**
 * Mirrors the formula in BIRDMAIL_PROJECT.md:
 * speed_actual = bird.speed * (1 + random(-variance, variance))
 * delivery_seconds = (distance_km / speed_actual) * 3600
 */
export function planDelivery(
  sender: LatLng,
  receiver: LatLng,
  bird: BirdStats,
  sentAt: Date = new Date(),
): DeliveryPlan {
  const distanceKm = haversineKm(sender, receiver);
  const varianceFactor = 1 + (Math.random() * 2 - 1) * bird.variancePct;
  const speedActualKmh = Math.max(1, bird.speedKmh * varianceFactor);
  const durationSec = (distanceKm / speedActualKmh) * 3600;
  const estimatedEta = new Date(sentAt.getTime() + durationSec * 1000);
  const willFail = Math.random() < bird.failRate;

  return { distanceKm, speedActualKmh, durationSec, estimatedEta, willFail };
}
