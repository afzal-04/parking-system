"use client";

import { useState } from "react";
import { TRAFFIC_FINE_RATES } from "@/lib/kspServicesData";

export default function FineRatesModal({ isOpen, onClose, lang = "en" }) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredRates = TRAFFIC_FINE_RATES.filter((item) => {
    const text = (
      (lang === "hi" ? item.violation : item.violationEn) +
      " " +
      item.section +
      " " +
      item.fine
    ).toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          maxWidth: 720,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
          border: "1px solid var(--line)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            background: "#92400e",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#fef3c7", fontWeight: 700, letterSpacing: "0.1em" }}>
              MOTOR VEHICLES ACT 2026 · STATUTORY PENALTY GUIDE
            </div>
            <h3 style={{ fontSize: 20, marginTop: 2, color: "white" }}>
              📜 {lang === "hi" ? "ट्रैफिक जुर्माना दर तालिका" : "Traffic Violation Fine Rates Chart"}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              fontSize: 18,
              width: 32,
              height: 32,
              borderRadius: "50%",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 14 }}>
            <input
              type="text"
              placeholder={
                lang === "hi"
                  ? "🔍 उल्लंघन या धारा खोजें (जैसे: हेलमेट, पार्किंग, Sec 177)..."
                  : "🔍 Search violation or section (e.g., Helmet, Parking, Sec 177)..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid var(--line-strong, #cbd5e1)",
                borderRadius: 8,
                fontSize: 13.5,
                outline: "none",
              }}
            />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "10px 12px", color: "#475569" }}>
                    {lang === "hi" ? "ट्रैफिक उल्लंघन" : "Traffic Violation"}
                  </th>
                  <th style={{ padding: "10px 12px", color: "#475569" }}>
                    {lang === "hi" ? "एमवीए धारा" : "MVA Section"}
                  </th>
                  <th style={{ padding: "10px 12px", color: "#475569", textAlign: "right" }}>
                    {lang === "hi" ? "जुर्माना राशि" : "Fine Amount"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRates.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: 20, textAlign: "center", color: "#64748b" }}>
                      {lang === "hi" ? "कोई परिणाम नहीं मिला" : "No matching fine records found"}
                    </td>
                  </tr>
                ) : (
                  filteredRates.map((f, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px", fontWeight: 600, color: "#0f172a" }}>
                        {lang === "hi" ? f.violation : f.violationEn}
                      </td>
                      <td style={{ padding: "12px", color: "#64748b", fontSize: 12 }}>
                        {f.section}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: 700, color: "#b91c1c" }}>
                        {f.fine}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              marginTop: 18,
              padding: 12,
              background: "#fffbeb",
              borderRadius: 8,
              fontSize: 12,
              color: "#92400e",
            }}
          >
            ⚖️ {lang === "hi"
              ? "नोट: बार-बार उल्लंघन करने पर ड्राइविंग लाइसेंस 3 माह के लिए निलंबित किया जा सकता है।"
              : "Note: Repeated offenses may result in driving license suspension for a minimum period of 3 months."}
          </div>

          <div style={{ marginTop: 20, textAlign: "right" }}>
            <button
              onClick={onClose}
              style={{
                background: "var(--navy-900)",
                color: "white",
                border: "none",
                padding: "8px 20px",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {lang === "hi" ? "बंद करें" : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
