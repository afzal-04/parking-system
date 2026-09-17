"use client";

import { useState } from "react";
import { LIVE_TRAFFIC_ADVISORIES } from "@/lib/kspServicesData";

export default function TrafficAdvisoryTicker({ lang = "en" }) {
  const [selectedAdvisory, setSelectedAdvisory] = useState(null);

  return (
    <>
      <div
        style={{
          background: "#fffbeb",
          borderBottom: "1px solid #fef08a",
          padding: "8px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            background: "#b45309",
            color: "white",
            fontSize: 11,
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: 4,
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
          }}
        >
           {lang === "hi" ? "ट्रैफिक एडवाइजरी" : "Traffic advisory"}
        </span>

        <div
          style={{
            display: "flex",
            gap: 20,
            overflowX: "auto",
            whiteSpace: "nowrap",
            fontSize: 13,
            color: "#78350f",
            flex: 1,
            alignItems: "center",
            scrollbarWidth: "none",
          }}
        >
          {LIVE_TRAFFIC_ADVISORIES.map((adv) => (
            <span
              key={adv.id}
              onClick={() => setSelectedAdvisory(adv)}
              style={{
                cursor: "pointer",
                fontWeight: 600,
                textDecoration: "underline",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {lang === "hi" ? adv.titleHi : adv.titleEn}
            </span>
          ))}
        </div>
      </div>

      {selectedAdvisory && (
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
              maxWidth: 520,
              width: "100%",
              padding: 24,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  background: "#fef3c7",
                  color: "#b45309",
                  padding: "4px 10px",
                  borderRadius: 12,
                }}
              >
                ● {selectedAdvisory.severity} ADVISORY
              </span>
              <span style={{ fontSize: 12, color: "#64748b" }}>Date: {selectedAdvisory.date}</span>
            </div>

            <h3 style={{ fontSize: 18, color: "#0f172a", marginBottom: 10 }}>
              {lang === "hi" ? selectedAdvisory.titleHi : selectedAdvisory.titleEn}
            </h3>

            <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, background: "#f8fafc", padding: 14, borderRadius: 8 }}>
              {lang === "hi" ? selectedAdvisory.detailHi : selectedAdvisory.detailEn}
            </p>

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button
                onClick={() => setSelectedAdvisory(null)}
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
      )}
    </>
  );
}
