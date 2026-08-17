export type LatLng = { lat: number; lng: number };

const EARTH_RADIUS_KM = 6371;

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/** Linear interpolation along the great-circle path, t in [0, 1]. */
export function interpolate(a: LatLng, b: LatLng, t: number): LatLng {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  };
}

/** Slight arc offset so flight paths don't render as dead-straight lines. */
export function arcPoint(a: LatLng, b: LatLng, t: number, bow = 0.08): LatLng {
  const base = interpolate(a, b, t);
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / dist;
  const ny = dx / dist;
  const arc = Math.sin(Math.PI * t) * dist * bow;
  return { lat: base.lat + ny * arc, lng: base.lng + nx * arc };
}

export function arcPath(a: LatLng, b: LatLng, steps = 64, bow = 0.08): LatLng[] {
  return Array.from({ length: steps + 1 }, (_, i) => arcPoint(a, b, i / steps, bow));
}
