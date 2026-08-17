"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import { arcPath, arcPoint } from "@/lib/geo";
import { DEMO_FLIGHTS, type DemoFlight } from "@/lib/flights";
import { TIER_LABEL } from "@/lib/birds";

const DEMO_PLAYBACK_SEC = 22; // compress real flight duration into a watchable demo

function cityIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:14px;height:14px;border-radius:9999px;
      background:${color};
      border:2px solid #fffdf8;
      box-shadow:0 0 0 3px ${color}33, 0 2px 6px rgba(42,32,24,0.35);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function birdIcon(emoji: string, bearing: number) {
  return L.divIcon({
    className: "",
    html: `<div style="
      transform: rotate(${bearing}deg);
      display:flex;align-items:center;justify-content:center;
      width:34px;height:34px;border-radius:9999px;
      background:radial-gradient(circle at 30% 30%, #fffdf8, #f7f3ea);
      border:1.5px solid #b8863b;
      box-shadow:0 4px 14px rgba(184,134,59,0.35);
      font-size:16px;
    ">
      <span style="display:inline-block;transform:rotate(${-bearing}deg)">${emoji}</span>
    </div>`,
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
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}j ${m}m`;
  if (m > 0) return `${m}m ${s}d`;
  return `${s}d`;
}

export default function BirdTrackerMap() {
  const [flightIndex, setFlightIndex] = useState(0);
  const flight: DemoFlight = DEMO_FLIGHTS[flightIndex];
  const [progress, setProgress] = useState(0); // 0..1
  const startRef = useRef<number>(Date.now());

  const path = useMemo(() => arcPath(flight.from.coords, flight.to.coords, 96), [flight]);

  useEffect(() => {
    startRef.current = Date.now();
    setProgress(0);
    const id = setInterval(() => {
      const t = (Date.now() - startRef.current) / 1000 / DEMO_PLAYBACK_SEC;
      setProgress(Math.min(1, t));
    }, 50);
    return () => clearInterval(id);
  }, [flight]);

  const current = arcPoint(flight.from.coords, flight.to.coords, progress, 0.08);
  const lookahead = arcPoint(flight.from.coords, flight.to.coords, Math.min(1, progress + 0.01), 0.08);
  const bearing = bearingBetween(current, lookahead);
  const remainingSec = Math.max(0, Math.round(flight.durationSec * (1 - progress)));
  const status = progress >= 1 ? "delivered" : "in_flight";

  const center = useMemo(
    () => arcPoint(flight.from.coords, flight.to.coords, 0.5, 0.08),
    [flight],
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border shadow-[0_1px_2px_rgba(42,32,24,0.05)]">
      <MapContainer
        key={flight.id}
        center={[center.lat, center.lng]}
        zoom={5}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <Polyline
          positions={path.map((p) => [p.lat, p.lng])}
          pathOptions={{ color: "#d8ae6c", weight: 2, dashArray: "1 8", opacity: 0.9 }}
        />
        <Polyline
          positions={arcPath(flight.from.coords, flight.to.coords, 96)
            .slice(0, Math.max(1, Math.round(progress * 96)))
            .map((p) => [p.lat, p.lng])}
          pathOptions={{ color: "#b8863b", weight: 2.5, opacity: 0.95 }}
        />

        <Marker position={[flight.from.coords.lat, flight.from.coords.lng]} icon={cityIcon("#7a2e26")}>
          <Tooltip direction="top" offset={[0, -8]} permanent={false}>
            {flight.from.name} · asal
          </Tooltip>
        </Marker>
        <Marker position={[flight.to.coords.lat, flight.to.coords.lng]} icon={cityIcon("#2e3a52")}>
          <Tooltip direction="top" offset={[0, -8]} permanent={false}>
            {flight.to.name} · tujuan
          </Tooltip>
        </Marker>

        <Marker
          position={[current.lat, current.lng]}
          icon={birdIcon(flight.bird.emoji, bearing)}
          zIndexOffset={1000}
        >
          <Tooltip direction="top" offset={[0, -18]}>
            {flight.bird.name} · {Math.round(flight.speedActualKmh)} km/h
          </Tooltip>
        </Marker>
      </MapContainer>

      {/* Flight info card */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex justify-center p-3 sm:justify-start sm:p-4">
        <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-gold/25 bg-surface/95 p-4 shadow-[0_10px_30px_rgba(42,32,24,0.12)] backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[13px] font-semibold">
              <span className="text-lg">{flight.bird.emoji}</span>
              {flight.bird.name}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                status === "delivered"
                  ? "bg-indigo/10 text-indigo"
                  : "bg-gold/10 text-gold"
              }`}
            >
              {status === "delivered" ? "Tiba" : "Terbang"}
            </span>
          </div>

          <p className="mt-2 truncate text-[13px] text-muted-foreground">
            “{flight.content}”
          </p>

          <div className="mt-3 flex items-center justify-between text-[12px] text-muted-foreground">
            <span>{flight.from.name}</span>
            <span className="text-gold">✦ {Math.round(flight.distanceKm)} km</span>
            <span>{flight.to.name}</span>
          </div>

          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold transition-[width] duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{TIER_LABEL[flight.bird.tier]} · risiko gagal {(flight.bird.failRate * 100).toFixed(1)}%</span>
            <span>{status === "delivered" ? "sampai" : `ETA ${formatEta(remainingSec)}`}</span>
          </div>
        </div>
      </div>

      {/* Flight selector */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] flex justify-center p-3 sm:justify-end sm:p-4">
        <div className="pointer-events-auto flex w-full max-w-full gap-2 overflow-x-auto rounded-full border border-border bg-surface/95 p-1.5 shadow-sm backdrop-blur sm:w-auto">
          {DEMO_FLIGHTS.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setFlightIndex(i)}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                i === flightIndex
                  ? "bg-foreground text-surface"
                  : "text-muted-foreground hover:bg-surface-raised"
              }`}
            >
              <span>{f.bird.emoji}</span>
              <span className="hidden sm:inline">
                {f.from.name} → {f.to.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
