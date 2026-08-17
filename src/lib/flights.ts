import type { LatLng } from "./geo";
import { haversineKm } from "./geo";
import { BIRDS } from "./birds";

export type City = { name: string; coords: LatLng };

export const CITIES: City[] = [
  { name: "Yogyakarta", coords: { lat: -7.7956, lng: 110.3695 } },
  { name: "Jakarta", coords: { lat: -6.2088, lng: 106.8456 } },
  { name: "Bandung", coords: { lat: -6.9175, lng: 107.6191 } },
  { name: "Surabaya", coords: { lat: -7.2575, lng: 112.7521 } },
  { name: "Denpasar", coords: { lat: -8.65, lng: 115.2167 } },
  { name: "Makassar", coords: { lat: -5.1477, lng: 119.4327 } },
  { name: "Medan", coords: { lat: 3.5952, lng: 98.6722 } },
];

export type DemoFlight = {
  id: string;
  from: City;
  to: City;
  bird: (typeof BIRDS)[number];
  distanceKm: number;
  speedActualKmh: number;
  durationSec: number;
  content: string;
};

export function makeDemoFlight(
  fromName: string,
  toName: string,
  birdSlug: string,
  content: string,
): DemoFlight {
  const from = CITIES.find((c) => c.name === fromName)!;
  const to = CITIES.find((c) => c.name === toName)!;
  const bird = BIRDS.find((b) => b.slug === birdSlug)!;
  const distanceKm = haversineKm(from.coords, to.coords);
  const speedActualKmh = bird.speedKmh * (1 - bird.variancePct * 0.3);
  const durationSec = (distanceKm / speedActualKmh) * 3600;

  return {
    id: `${fromName}-${toName}-${birdSlug}`,
    from,
    to,
    bird,
    distanceKm,
    speedActualKmh,
    durationSec,
    content,
  };
}

export const DEMO_FLIGHTS: DemoFlight[] = [
  makeDemoFlight("Yogyakarta", "Jakarta", "eagle", "Titip salam buat Bapak, ya."),
  makeDemoFlight("Bandung", "Surabaya", "common_pigeon", "Sampai jumpa akhir pekan!"),
  makeDemoFlight("Denpasar", "Makassar", "golden_eagle", "Selamat ulang tahun 🎉"),
  makeDemoFlight("Medan", "Yogyakarta", "owl", "Aku kirim naskah revisiannya."),
];
