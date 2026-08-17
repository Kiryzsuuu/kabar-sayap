"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";
import L from "leaflet";
import { arcPath, arcPoint } from "@/lib/geo";

type TrackData = {
  id: string;
  status: "in_flight" | "delivered" | "lost";
  currentCoords: { lat: number; lng: number };
  senderCoords: { lat: number; lng: number };
  receiverCoords: { lat: number; lng: number };
  distanceKm: number;
  speedActualKmh: number;
  sentAt: string;
  estimatedEta: string;
  content: string;
  bird: { name: string; emoji: string };
};

function cityIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid #fffdf8;box-shadow:0 0 0 3px ${color}33,0 2px 6px rgba(42,32,24,.35);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function birdIcon(emoji: string, bearing: number) {
  return L.divIcon({
    className: "",
    html: `<div style="transform:rotate(${bearing}deg);display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:radial-gradient(circle at 30% 30%,#fffdf8,#f7f3ea);border:1.5px solid #b8863b;box-shadow:0 4px 14px rgba(184,134,59,.35);font-size:16px;"><span style="display:inline-block;transform:rotate(${-bearing}deg)">${emoji}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function bearingBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dy = b.lat - a.lat;
  const dx = b.lng - a.lng;
  return (Math.atan2(dx, dy) * 180) / Math.PI;
}

function formatEta(sec: number) {
  if (sec <= 0) return "0d";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}j ${m}m`;
  if (m > 0) return `${m}m ${s}d`;
  return `${s}d`;
}

/** Polls for authoritative status/coords every POLL_MS, but animates the
 * bird's position continuously in between so it glides instead of jumping. */
const POLL_MS = 6000;
const TICK_MS = 50;

export function LiveMessageMap({ messageId }: { messageId: string }) {
  const [data, setData] = useState<TrackData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`/api/messages/${messageId}/track`, { cache: "no-store" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Gagal memuat data pelacakan.");
        }
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
      }
    }
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [messageId]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const path = useMemo(
    () => (data ? arcPath(data.senderCoords, data.receiverCoords, 96) : []),
    [data],
  );

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl border border-border bg-surface text-[13px] text-maroon">
        {error}
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl border border-border bg-surface text-[13px] text-muted-foreground">
        Memuat posisi burung…
      </div>
    );
  }

  const totalMs = new Date(data.estimatedEta).getTime() - new Date(data.sentAt).getTime();
  const elapsedMs = now - new Date(data.sentAt).getTime();
  const progress =
    data.status === "delivered" ? 1 : Math.min(1, totalMs > 0 ? elapsedMs / totalMs : 1);

  const current =
    data.status === "in_flight"
      ? arcPoint(data.senderCoords, data.receiverCoords, progress, 0.08)
      : data.currentCoords;
  const lookahead = arcPoint(data.senderCoords, data.receiverCoords, Math.min(1, progress + 0.005), 0.08);
  const bearing = bearingBetween(current, lookahead);

  const center = path[Math.floor(path.length / 2)] ?? current;
  const remainingSec = Math.max(0, Math.round((totalMs - elapsedMs) / 1000));

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border shadow-[0_1px_2px_rgba(42,32,24,0.05)]">
      <MapContainer center={[center.lat, center.lng]} zoom={6} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <Polyline
          positions={path.map((p) => [p.lat, p.lng])}
          pathOptions={{ color: "#d8ae6c", weight: 2, dashArray: "1 8", opacity: 0.9 }}
        />
        <Polyline
          positions={path
            .slice(0, Math.max(1, Math.round(progress * path.length)))
            .map((p) => [p.lat, p.lng])}
          pathOptions={{ color: "#b8863b", weight: 2.5, opacity: 0.95 }}
        />
        <Marker position={[data.senderCoords.lat, data.senderCoords.lng]} icon={cityIcon("#7a2e26")}>
          <Tooltip direction="top" offset={[0, -8]}>Asal</Tooltip>
        </Marker>
        <Marker position={[data.receiverCoords.lat, data.receiverCoords.lng]} icon={cityIcon("#2e3a52")}>
          <Tooltip direction="top" offset={[0, -8]}>Tujuan</Tooltip>
        </Marker>
        <Marker
          position={[current.lat, current.lng]}
          icon={birdIcon(data.bird.emoji, bearing)}
          zIndexOffset={1000}
        >
          <Tooltip direction="top" offset={[0, -18]}>
            {data.bird.name} · {Math.round(data.speedActualKmh)} km/h
          </Tooltip>
        </Marker>
      </MapContainer>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex justify-center p-3 sm:justify-start sm:p-4">
        <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-gold/25 bg-surface/95 p-4 shadow-[0_10px_30px_rgba(42,32,24,0.12)] backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[13px] font-semibold">
              <span className="text-lg">{data.bird.emoji}</span>
              {data.bird.name}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                data.status === "delivered"
                  ? "bg-indigo/10 text-indigo"
                  : data.status === "lost"
                    ? "bg-maroon/10 text-maroon"
                    : "bg-gold/10 text-gold"
              }`}
            >
              {data.status === "delivered" ? "Tiba" : data.status === "lost" ? "Hilang" : "Terbang"}
            </span>
          </div>

          <p className="mt-2 truncate text-[13px] text-muted-foreground">“{data.content}”</p>

          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold transition-[width] duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{Math.round(data.distanceKm)} km</span>
            <span>
              {data.status === "in_flight" ? `ETA ${formatEta(remainingSec)}` : data.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
