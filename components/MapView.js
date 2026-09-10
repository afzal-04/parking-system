"use client";

import React, { Fragment, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, Polygon, Polyline, useMap } from "react-leaflet";
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

function policeStationIcon(isSelected) {
  return L.divIcon({
    className: isSelected ? "patrol-vehicle-selected" : "",
    html: `<div style="background:#1e3a8a;color:#ffffff;font-weight:700;font-size:11px;padding:3px 7px;border-radius:12px;box-shadow:0 3px 10px rgba(30,58,138,0.5);display:flex;align-items:center;gap:4px;border:2px solid ${isSelected ? "#fbbf24" : "#93c5fd"};white-space:nowrap;cursor:pointer;">🏢 <span style="font-size:10.5px;">थाना</span></div>`,
    iconSize: [36, 26],
    iconAnchor: [18, 13],
  });
}

function patrolVehicleIcon(patrol, isSelected) {
  const isBike = patrol.vehicleCategory === "bike_squad";
  const isERV = patrol.vehicleCategory === "erv";
  const isInterceptor = patrol.vehicleCategory === "interceptor";
  const symbol = isBike ? "🏍️" : isERV ? "🚨" : isInterceptor ? "🚓" : "🚔";
  
  const bgColor = isERV ? "#991b1b" : isBike ? "#d97706" : isInterceptor ? "#0f766e" : "#b91c1c";
  const borderColor = isSelected ? "#fbbf24" : isERV ? "#fca5a5" : "#fecaca";
  const codeTag = patrol.callSign || patrol.code;

  return L.divIcon({
    className: `patrol-beacon-pulse ${isSelected ? "patrol-vehicle-selected" : ""}`,
    html: `
      <div style="background:${bgColor};color:#ffffff;font-weight:700;font-size:11px;padding:3px 8px;border-radius:14px;box-shadow:0 2px 10px rgba(0,0,0,0.4);display:flex;align-items:center;gap:4px;border:2px solid ${borderColor};white-space:nowrap;cursor:pointer;position:relative;">
        <span style="font-size:13px;">${symbol}</span>
        <span style="font-size:10px;font-family:monospace;background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:4px;letter-spacing:0.5px;">${codeTag}</span>
        ${patrol.speed && patrol.speed !== "0 km/h" ? `<span style="font-size:9px;background:#22c55e;color:#022c22;font-weight:800;padding:1px 3px;border-radius:3px;">${patrol.speed}</span>` : ''}
      </div>
    `,
    iconSize: [84, 28],
    iconAnchor: [42, 14],
  });
}

function userLocationIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="background:#0284c7;color:#ffffff;font-weight:700;font-size:11px;padding:3px 8px;border-radius:12px;box-shadow:0 0 14px rgba(2,132,199,0.7);display:flex;align-items:center;gap:4px;border:2px solid #bae6fd;white-space:nowrap;">📍 <span style="font-size:10.5px;">आप (You)</span></div>`,
    iconSize: [34, 26],
    iconAnchor: [17, 13],
  });
}

// Controller component to smoothly fly and re-center map upon area/focus selection
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && map) {
      map.flyTo(center, zoom || map.getZoom(), {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapView({
  complaints = [],
  trafficPoints = [],
  parkingPoints = [],
  policeStations = [],
  patrolUnits = [],
  userLocation = null,
  center = null,
  zoom = 12,
  selectedAreaPolygon = null,
  height = 340,
  onSelect,
  onDispatchPatrol,
  selectedId,
  lang = "hi",
  mode = "all", // "traffic" | "parking" | "complaints" | "police" | "patrol" | "all"
}) {
  const showComplaints = (mode === "all" || mode === "complaints") && complaints.length > 0;
  const showTraffic = (mode === "all" || mode === "traffic") && trafficPoints.length > 0;
  const showParking = (mode === "all" || mode === "parking") && parkingPoints.length > 0;
  const showPolice = (mode === "all" || mode === "police" || mode === "patrol") && (policeStations.length > 0 || patrolUnits.length > 0);
  const showPatrolUnits = (mode === "all" || mode === "police" || mode === "patrol") && patrolUnits.length > 0;

  // Map traffic level by junction ID
  const trafficLevelMap = {};
  trafficPoints.forEach((p) => {
    trafficLevelMap[p.id] = p;
  });

  const effectiveCenter = center || (userLocation ? [userLocation.lat, userLocation.lng] : RAIPUR_CENTER);

  return (
    <MapContainer
      center={effectiveCenter}
      zoom={zoom || 12}
      scrollWheelZoom={false}
      style={{ height, width: "100%", borderRadius: "10px" }}
    >
      <MapController center={effectiveCenter} zoom={zoom} />

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
          fillOpacity: 0.03,
          dashArray: "6 6",
        }}
      />

      {/* Highlighted Area Sector Polygon when filtered */}
      {selectedAreaPolygon && (
        <Polygon
          positions={selectedAreaPolygon}
          pathOptions={{
            color: "#dc2626",
            weight: 2.5,
            fillColor: "#ef4444",
            fillOpacity: 0.12,
            dashArray: "4 4",
          }}
        />
      )}

      {/* User Current Location Pin */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon()}>
          <Popup>
            <div style={{ minWidth: 150 }}>
              <strong style={{ color: "#0369a1", fontSize: 13 }}>📍 {lang === "hi" ? "आपकी वर्तमान लोकेशन" : "Your Current Location"}</strong>
              <div style={{ marginTop: 4, fontSize: 11.5, color: "#64748b" }}>
                GPS: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>
      )}

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

      {/* Render Clean, High-Contrast Traffic Road Corridors */}
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
              {/* Crisp White Outer Halo */}
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
              {/* Inner Live Traffic Color */}
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

      {/* Police Stations Markers */}
      {showPolice &&
        policeStations.map((stn) => {
          const isSelected = selectedId === stn.id;
          return (
            <Marker
              key={stn.id}
              position={[stn.lat, stn.lng]}
              icon={policeStationIcon(isSelected)}
              eventHandlers={{
                click: () => onSelect && onSelect(stn.id),
              }}
            >
              <Popup>
                <div style={{ minWidth: 220, padding: "2px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 4 }}>
                    <span style={{ background: "#1e3a8a", color: "white", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                      {stn.code || "PS"}
                    </span>
                    <span style={{ color: "#16a34a", fontSize: 11, fontWeight: 700 }}>● 24x7 Active</span>
                  </div>
                  <strong style={{ fontSize: 13.5, color: "#0f172a" }}>
                    🏢 {lang === "hi" ? stn.name : stn.nameEn}
                  </strong>
                  <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
                    📍 {lang === "hi" ? stn.address : stn.addressEn}
                  </div>
                  {stn.distanceKm && (
                    <div style={{ marginTop: 4, fontSize: 12, color: "#1e3a8a", fontWeight: 700 }}>
                      📏 {stn.distanceKm} km {lang === "hi" ? "दूरी" : "away"}
                    </div>
                  )}
                  <div style={{ marginTop: 6, padding: "6px 8px", background: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 11.5 }}>
                    <div style={{ color: "#334155" }}>
                      👤 <strong>{lang === "hi" ? stn.inChargeRankHi : stn.inChargeRank}:</strong> {stn.inCharge}
                    </div>
                    <div style={{ marginTop: 3 }}>
                      📞 <a href={`tel:${stn.phone}`} style={{ color: "#1e40af", fontWeight: 700 }}>{stn.phone}</a>
                    </div>
                    <div style={{ marginTop: 2, color: "#64748b", fontSize: 11 }}>
                      🚓 {lang === "hi" ? "संबद्ध पेट्रोलिंग:" : "Patrol Unit:"} <strong>{stn.assignedPatrol}</strong>
                    </div>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${stn.lat},${stn.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: "#1e40af",
                        background: "#eff6ff",
                        padding: "4px 8px",
                        borderRadius: 6,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      🧭 {lang === "hi" ? "दिशा-निर्देश" : "Directions"}
                    </a>
                    <a
                      href={`tel:${stn.phone}`}
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: "#15803d",
                        background: "#dcfce7",
                        padding: "4px 8px",
                        borderRadius: 6,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      📞 {lang === "hi" ? "कॉल करें" : "Call"}
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

      {/* Live Patrolling Police Units Markers */}
      {showPatrolUnits &&
        patrolUnits.map((patrol) => {
          const isSelected = selectedId === patrol.id;
          return (
            <Marker
              key={patrol.id}
              position={[patrol.lat, patrol.lng]}
              icon={patrolVehicleIcon(patrol, isSelected)}
              eventHandlers={{
                click: () => onSelect && onSelect(patrol.id),
              }}
            >
              <Popup>
                <div style={{ minWidth: 230, padding: "2px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 4 }}>
                    <span style={{ background: patrol.vehicleCategory === "erv" ? "#991b1b" : "#b91c1c", color: "white", padding: "2px 6px", borderRadius: 4, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.5px" }}>
                      {patrol.code} · {patrol.callSign}
                    </span>
                    <span style={{ color: patrol.status === "responding" ? "#ea580c" : patrol.status === "standby" ? "#64748b" : "#16a34a", fontSize: 11, fontWeight: 700 }}>
                      ● {lang === "hi" ? patrol.statusLabel?.hi || "सक्रिय गश्त" : patrol.statusLabel?.en || "Active Patrol"}
                    </span>
                  </div>

                  <strong style={{ fontSize: 14, color: "#0f172a" }}>
                    {patrol.vehicleCategory === "bike_squad" ? "🏍️" : patrol.vehicleCategory === "erv" ? "🚨" : patrol.vehicleCategory === "interceptor" ? "🚓" : "🚔"}{" "}
                    {lang === "hi" ? patrol.name : patrol.nameEn}
                  </strong>
                  
                  <div style={{ fontSize: 11.5, color: "#475569", marginTop: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>🏢 {lang === "hi" ? patrol.stationName : patrol.stationNameEn}</span>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e3a8a", background: "#eff6ff", padding: "1px 4px", borderRadius: 3 }}>
                      {patrol.vehicleNumber}
                    </span>
                  </div>

                  <div style={{ marginTop: 6, padding: "6px 8px", background: "#fef2f2", borderRadius: 6, border: "1px solid #fee2e2", fontSize: 11.5 }}>
                    <div style={{ color: "#991b1b" }}>
                      🛣️ <strong>{lang === "hi" ? "गश्त क्षेत्र:" : "Sector:"}</strong> {lang === "hi" ? patrol.sector : patrol.sectorEn}
                    </div>
                    <div style={{ marginTop: 3, color: "#334155" }}>
                      👮 <strong>{lang === "hi" ? patrol.officerRankHi : patrol.officerRank}:</strong> {patrol.officer}
                    </div>
                    <div style={{ marginTop: 3, display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: 11 }}>
                      <span>⚡ {lang === "hi" ? "गति" : "Speed"}: <strong style={{ color: "#0f172a" }}>{patrol.speed || "20 km/h"}</strong></span>
                      <span>🔋 {lang === "hi" ? "ईंधन" : "Fuel"}: <strong style={{ color: "#16a34a" }}>{patrol.fuelBattery || "85%"}</strong></span>
                    </div>
                  </div>

                  <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${patrol.lat},${patrol.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: "#1e40af",
                        background: "#eff6ff",
                        padding: "4px 8px",
                        borderRadius: 6,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      🧭 {lang === "hi" ? "दिशा-निर्देश" : "Directions"}
                    </a>
                    <a
                      href={`tel:${patrol.mobile || patrol.phone}`}
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: "#dc2626",
                        background: "#fef2f2",
                        padding: "4px 8px",
                        borderRadius: 6,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      📞 {lang === "hi" ? "कॉल पेट्रोल" : "Call Officer"}
                    </a>
                    {onDispatchPatrol && (
                      <button
                        type="button"
                        onClick={() => onDispatchPatrol(patrol.id)}
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: "#ffffff",
                          background: "#dc2626",
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        🚨 {lang === "hi" ? "अलर्ट भेजें" : "Send Alert"}
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}