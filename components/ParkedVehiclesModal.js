"use client";

import { useState, useMemo } from "react";
import { normalizePlate } from "@/lib/parkingData";

export default function ParkedVehiclesModal({ isOpen, onClose, zone, lang = "en" }) {
  const [search, setSearch] = useState("");

  const vehicles = useMemo(() => {
    if (!zone || !Array.isArray(zone.parkedVehicles)) return [];
    if (!search.trim()) return zone.parkedVehicles;

    const q = search.trim().toLowerCase();
    const qNorm = normalizePlate(search.trim());

    return zone.parkedVehicles.filter((v) => {
      const vPlateNorm = normalizePlate(v.vehicleNumber || "");
      const plateMatches =
        (qNorm.length >= 2 && vPlateNorm.includes(qNorm)) ||
        (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(q));

      const otherMatches =
        (v.model && v.model.toLowerCase().includes(q)) ||
        (v.type && v.type.toLowerCase().includes(q)) ||
        (v.slot && v.slot.toLowerCase().includes(q)) ||
        (v.ownerName && v.ownerName.toLowerCase().includes(q));

      return plateMatches || otherMatches;
    });
  }, [zone, search]);

  if (!isOpen || !zone) return null;

  const freeSpots = zone.totalSpots - zone.occupiedSpots;
  const pct = Math.round((zone.occupiedSpots / zone.totalSpots) * 100);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--paper-raised, #ffffff)",
          borderRadius: 14,
          maxWidth: 780,
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          border: "1px solid var(--line, #e2e8f0)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--line, #e2e8f0)",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}></span>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "white" }}>
                  {lang === "hi" ? zone.name : zone.nameEn}
                </h3>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                   {lang === "hi" ? zone.address : zone.addressEn} · <span style={{ color: "#38bdf8" }}>{zone.type}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "white",
              fontSize: 16,
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            ✕
          </button>
        </div>

        {/* Capacity Overview Bar */}
        <div
          style={{
            padding: "12px 24px",
            background: "#f8fafc",
            borderBottom: "1px solid var(--line, #e2e8f0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
            <div>
              <span style={{ color: "#64748b" }}>{lang === "hi" ? "कुल क्षमता:" : "Total Capacity:"}</span>{" "}
              <strong>{zone.totalSpots} spots</strong>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>{lang === "hi" ? "भरे हुए:" : "Occupied:"}</span>{" "}
              <strong style={{ color: "#ea580c" }}>{zone.occupiedSpots} spots</strong>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>{lang === "hi" ? "खाली स्थान:" : "Available:"}</span>{" "}
              <strong style={{ color: "#16a34a" }}>{freeSpots} spots</strong>
            </div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: pct > 85 ? "#dc2626" : pct > 60 ? "#d97706" : "#16a34a" }}>
            ● {pct}% {lang === "hi" ? "उपयोग" : "Utilized"}
          </div>
        </div>

        {/* Modal Search Bar */}
        <div style={{ padding: "14px 24px 8px" }}>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
                fontSize: 14,
              }}
            >
              
            </span>
            <input
              type="text"
              placeholder={
                lang === "hi"
                  ? "वाहन नंबर, मॉडल, स्लॉट या चालक खोजें..."
                  : "Search vehicle number (e.g. CG-04-MB-1245), model, slot..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                fontSize: 13,
                border: "1px solid var(--line-strong, #cbd5e1)",
                borderRadius: 8,
                outline: "none",
                background: "white",
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                
              </button>
            )}
          </div>
        </div>

        {/* Parked Vehicles Table */}
        <div style={{ padding: "8px 24px 24px", overflowY: "auto", flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
              {lang === "hi" ? "वर्तमान में खड़े वाहन" : "Currently Parked Vehicles"} ({vehicles.length})
            </span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              {lang === "hi" ? "ANPR व स्मार्ट सेंसर लॉग" : "ANPR & RFID Smart Bay Log"}
            </span>
          </div>

          {vehicles.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "36px 20px",
                color: "#64748b",
                background: "#f8fafc",
                borderRadius: 8,
                border: "1px dashed #cbd5e1",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}></div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {search
                  ? (lang === "hi" ? "कोई वाहन नहीं मिला" : "No matching vehicle found in this hub")
                  : (lang === "hi" ? "कोई वाहन डेटा उपलब्ध नहीं" : "No vehicle records available")}
              </div>
              <div style={{ fontSize: 12, marginTop: 4, color: "#94a3b8" }}>
                {search ? (lang === "hi" ? "कृपया वाहन संख्या पुनः जाँचे" : "Try searching by another vehicle number or slot") : ""}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: "#f1f5f9", borderBottom: "1.5px solid #cbd5e1", textAlign: "left" }}>
                    <th style={{ padding: "8px 10px", color: "#475569", fontWeight: 600, fontSize: 11.5 }}>VEHICLE NUMBER</th>
                    <th style={{ padding: "8px 10px", color: "#475569", fontWeight: 600, fontSize: 11.5 }}>MODEL & CATEGORY</th>
                    <th style={{ padding: "8px 10px", color: "#475569", fontWeight: 600, fontSize: 11.5 }}>SLOT / BAY</th>
                    <th style={{ padding: "8px 10px", color: "#475569", fontWeight: 600, fontSize: 11.5 }}>ENTRY TIME</th>
                    <th style={{ padding: "8px 10px", color: "#475569", fontWeight: 600, fontSize: 11.5 }}>OWNER / DRIVER</th>
                    <th style={{ padding: "8px 10px", color: "#475569", fontWeight: 600, fontSize: 11.5 }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        background: idx % 2 === 0 ? "white" : "#fafafa",
                      }}
                    >
                      {/* HSRP Plate UI */}
                      <td style={{ padding: "9px 10px" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            background: "#ffffff",
                            border: "1.5px solid #1e293b",
                            borderRadius: 4,
                            overflow: "hidden",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                          }}
                        >
                          <div
                            style={{
                              background: "#1e3a8a",
                              color: "white",
                              padding: "2px 4px",
                              fontSize: 9,
                              fontWeight: 800,
                              letterSpacing: 0.5,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              lineHeight: 1,
                            }}
                          >
                            <span>IND</span>
                          </div>
                          <span
                            style={{
                              padding: "2px 7px",
                              fontFamily: "var(--font-mono, monospace)",
                              fontWeight: 700,
                              fontSize: 12,
                              color: "#0f172a",
                              letterSpacing: 0.5,
                            }}
                          >
                            {v.vehicleNumber}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "9px 10px" }}>
                        <strong>{v.model}</strong>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{v.type}</div>
                      </td>

                      <td style={{ padding: "9px 10px" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontWeight: 700,
                            fontSize: 11.5,
                            background: "#e0f2fe",
                            color: "#0369a1",
                            padding: "2px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {v.slot}
                        </span>
                      </td>

                      <td style={{ padding: "9px 10px", color: "#334155" }}>
                         {v.entryTime}
                      </td>

                      <td style={{ padding: "9px 10px", color: "#475569" }}>
                        {v.ownerName || "—"}
                      </td>

                      <td style={{ padding: "9px 10px" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#15803d",
                            background: "#dcfce7",
                            padding: "2px 8px",
                            borderRadius: 12,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          ● {v.status || "PARKED"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "12px 24px",
            borderTop: "1px solid var(--line, #e2e8f0)",
            background: "#f8fafc",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "7px 16px",
              background: "#334155",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {lang === "hi" ? "बंद करें" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
