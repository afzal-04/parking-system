"use client";

import React, { Fragment } from "react";
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, Polygon, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TRAFFIC_ROADS } from "@/lib/trafficData";

const RAIPUR_CENTER = [21.2460, 81.6360];

// Verified Raipur Police Commissionerate boundary perimeter
const BOUNDARY = [
  [21.3100, 81.6200],
  [21.2950, 81.6900],
  [21.2650, 81.7200],
  [21.1900, 81.7450],
  [21.1500, 81.7100],
  [21.1400, 81.6500],
  [21.1600, 81.5800],
  [21.2200, 81.5400],
  [21.2800, 81.5500],
  [21.3100, 81.6200],
];

const STATUS_COLOR = {
  pending: "#c0433a",
  in_progress: "#e0a838",
  resolved: "#16a34a",
};

// Standard Traffic Color Palette (Google Maps Traffic Standard)
const TRAFFIC_COLOR = {
  free: "#16a34a",      // Fast & Free Flow (Emerald Green)
  moderate: "#f59e0b",  // Moderate Slowdown (Amber Yellow)
  heavy: "#ef4444",     // Heavy Congestion (Vivid Red)
  standstill: "#991b1b",// Severe Jam (Dark Red)
};

function trafficIcon(level) {
  const color = TRAFFIC_COLOR[level] || TRAFFIC_COLOR.free;
  return L.divIcon({
    className: "",
    html: `<span class="traffic-pulse" style="--pulse-color:${color}; background-color:${color};"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

const PARKING_COLOR = {
  available: "#16a34a",
  filling: "#d97706",
  full: "#dc2626",
};

function parkingIcon(status) {
  const color = PARKING_COLOR[status] || PARKING_COLOR.available;
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};color:white;font-weight:bold;font-size:11px;padding:3px 6px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;gap:3px;border:2px solid white;white-space:nowrap;cursor:pointer;">🅿️</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export default function MapView({
  complaints = [],
  trafficPoints = [],
  parkingPoints = [],
  height = 340,
  onSelect,
  selectedId,
  lang = "hi",
  mode = "all", // "traffic" | "parking" | "complaints" | "all"
}) {
  const showComplaints = (mode === "all" || mode === "complaints") && complaints.length > 0;
  const showTraffic = (mode === "all" || mode === "traffic") && trafficPoints.length > 0;
  const showParking = (mode === "all" || mode === "parking") && parkingPoints.length > 0;

  // Map traffic level by junction ID
  const trafficLevelMap = {};
  trafficPoints.forEach((p) => {
    trafficLevelMap[p.id] = p;
  });

  return (
    <MapContainer
      center={RAIPUR_CENTER}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height, width: "100%", borderRadius: "10px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Commissionerate Boundary */}
      <Polygon
        positions={BOUNDARY}
        pathOptions={{
          color: "#1e3a8a",
          weight: 2,
          fillColor: "#3b82f6",
          fillOpacity: 0.04,
          dashArray: "6 6",
        }}
      />

      {/* Citizen Complaints Markers */}
      {showComplaints &&
        complaints.map((c) => (
          <CircleMarker
            key={c.id}
            center={[c.lat, c.lng]}
            radius={c.id === selectedId ? 12 : 8}
            pathOptions={{
              color: STATUS_COLOR[c.status] || "#c0433a",
              fillColor: STATUS_COLOR[c.status] || "#c0433a",
              fillOpacity: 0.85,
              weight: c.id === selectedId ? 3 : 1.5,
            }}
            eventHandlers={{
              click: () => onSelect && onSelect(c.id),
            }}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <strong style={{ color: "#0f172a", fontSize: 13 }}>📍 {c.location}</strong>
                <div style={{ marginTop: 4, fontSize: 12, color: "#475569" }}>
                  {c.category} — <strong>{c.id}</strong>
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: STATUS_COLOR[c.status] || "#64748b", fontWeight: 700 }}>
                  ● {c.status === "resolved" ? "Resolved" : c.status === "in_progress" ? "In Progress" : "Pending"}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

      {/* Render Clean, High-Contrast Google/Apple Maps Style Traffic Road Corridors */}
      {showTraffic &&
        TRAFFIC_ROADS.map((road) => {
          const point = trafficLevelMap[road.junctionId];
          const level = point?.level || "free";
          const color = TRAFFIC_COLOR[level] || TRAFFIC_COLOR.free;
          const levelLabel =
            point?.levelLabel ||
            (level === "heavy"
              ? lang === "hi" ? "भारी जाम" : "Heavy Jam"
              : level === "moderate"
              ? lang === "hi" ? "मध्यम" : "Moderate Slowdown"
              : lang === "hi" ? "सामान्य प्रवाह" : "Free Flow");
          const estSpeed = road.speedEstimate?.[level] || (level === "free" ? "45 km/h" : level === "moderate" ? "20 km/h" : "8 km/h");

          return (
            <Fragment key={road.id}>
              {/* Crisp White Outer Halo for sharp contrast on road maps */}
              <Polyline
                positions={road.path}
                pathOptions={{
                  color: "#ffffff",
                  weight: 7,
                  opacity: 0.95,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
              {/* Inner High-Visibility Live Traffic Color */}
              <Polyline
                positions={road.path}
                pathOptions={{
                  color,
                  weight: 4.5,
                  opacity: 0.95,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              >
                <Popup>
                  <div style={{ minWidth: 175, padding: "2px 0" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                      🛣️ {lang === "hi" ? road.name : road.nameEn}
                    </div>
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "#475569" }}>
                        {lang === "hi" ? "ट्रैफिक स्थिति:" : "Status:"}
                      </span>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          color,
                          background: `${color}18`,
                          padding: "2px 8px",
                          borderRadius: 10,
                        }}
                      >
                        ● {levelLabel}
                      </span>
                    </div>
                    <div style={{ marginTop: 4, fontSize: 12, color: "#334155" }}>
                      ⏱️ {lang === "hi" ? "अनुमानित गति: " : "Est. Speed: "}
                      <strong>{estSpeed}</strong>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            </Fragment>
          );
        })}

      {/* Junction Nodes with Live Pulse */}
      {showTraffic &&
        trafficPoints.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={trafficIcon(p.level)}>
            <Popup>
              <div style={{ minWidth: 160 }}>
                <strong style={{ fontSize: 13, color: "#0f172a" }}>
                  📍 {lang === "hi" ? p.name : p.nameEn}
                </strong>
                <br />
                <span style={{ fontSize: 11.5, color: "#64748b" }}>
                  {lang === "hi" ? p.nameEn : p.name}
                </span>
                <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{lang === "hi" ? "जंक्शन स्थिति:" : "Junction Status:"}</span>
                  <span
                    style={{
                      color: TRAFFIC_COLOR[p.level],
                      fontWeight: 700,
                      background: `${TRAFFIC_COLOR[p.level]}18`,
                      padding: "2px 6px",
                      borderRadius: 8,
                    }}
                  >
                    ● {p.levelLabel}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Smart Parking Locations */}
      {showParking &&
        parkingPoints.map((p) => {
          const freeSpots = p.totalSpots - p.occupiedSpots;
          const statusText =
            p.status === "available"
              ? lang === "hi" ? "उपलब्ध" : "AVAILABLE"
              : p.status === "filling"
              ? lang === "hi" ? "भर रहा है" : "FILLING FAST"
              : lang === "hi" ? "पूर्ण" : "FULL";

          return (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={parkingIcon(p.status)}
              eventHandlers={{
                click: () => onSelect && onSelect(p.id),
              }}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <strong style={{ fontSize: 13, color: "#0f172a" }}>
                    🅿️ {lang === "hi" ? p.name : p.nameEn}
                  </strong>
                  <br />
                  <span style={{ fontSize: 11.5, color: "#64748b" }}>
                    {lang === "hi" ? p.address : p.addressEn}
                  </span>
                  <div style={{ marginTop: 6, fontSize: 12.5 }}>
                    <strong style={{ color: "#0f172a" }}>{freeSpots}</strong> / {p.totalSpots}{" "}
                    {lang === "hi" ? "स्थान खाली" : "free spots available"}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: PARKING_COLOR[p.status],
                      fontWeight: "bold",
                      marginTop: 4,
                      textTransform: "uppercase",
                    }}
                  >
                    ● {statusText} ({p.occupiedSpots} occupied)
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-block",
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: "#1e40af",
                        textDecoration: "none",
                      }}
                    >
                      🧭 {lang === "hi" ? "दिशा-निर्देश (Google Maps)" : "Get Directions (Google Maps)"}
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}