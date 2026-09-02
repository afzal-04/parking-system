"use client";

import { useState } from "react";
import { MOCK_TRAFFIC_NOCS } from "@/lib/dtpServicesData";

export default function VehicleNocModal({ isOpen, onClose, lang = "en" }) {
  const [query, setQuery] = useState("CG 04 AB 1234");
  const [nocRecord, setNocRecord] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  function handleSearch(e) {
    e.preventDefault();
    const clean = query.replaceAll(" ", "").toUpperCase();
    const found = MOCK_TRAFFIC_NOCS.find((n) => n.vehicleNo.replaceAll(" ", "").toUpperCase() === clean);
    setNocRecord(found || null);
    setHasSearched(true);
  }

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
          maxWidth: 620,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
          border: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            background: "#047857",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#a7f3d0", fontWeight: 700, letterSpacing: "0.1em" }}>
              DELHI TRAFFIC POLICE MODEL · TRAFFIC NOC VERIFICATION
            </div>
            <h3 style={{ fontSize: 20, marginTop: 2, color: "white" }}>
              📄 {lang === "hi" ? "वाहन ट्रैफिक एनओसी (NOC) सत्यापन" : "Vehicle Traffic NOC Clearance Status"}
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

        <div style={{ padding: 24 }}>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === "hi" ? "वाहन नंबर (उदा. CG 04 AB 1234)" : "Enter Vehicle Reg. No. (e.g. CG 04 AB 1234)"}
              style={{
                flex: 1,
                padding: "12px 14px",
                border: "1.5px solid var(--line-strong)",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textTransform: "uppercase",
              }}
              required
            />
            <button
              type="submit"
              style={{
                background: "#047857",
                color: "white",
                border: "none",
                padding: "0 22px",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              🔍 {lang === "hi" ? "NOC खोजें" : "Verify NOC"}
            </button>
          </form>

          {hasSearched && (
            <div>
              {nocRecord ? (
                <div style={{ background: "#ecfdf5", border: "2px dashed #059669", borderRadius: 12, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#047857" }}>
                      OFFICIAL TRAFFIC CLEARANCE CERTIFICATE
                    </span>
                    <span style={{ fontSize: 12, background: "#d1fae5", color: "#065f46", padding: "4px 10px", borderRadius: 12, fontWeight: 800 }}>
                      ✓ NOC CLEARED
                    </span>
                  </div>

                  <h4 style={{ fontSize: 18, color: "#0f172a", marginBottom: 8 }}>
                    Vehicle: <strong>{nocRecord.vehicleNo}</strong>
                  </h4>

                  <div style={{ fontSize: 13, color: "#334155", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div><strong>Owner Name:</strong> {nocRecord.ownerName}</div>
                    <div><strong>Chassis No:</strong> {nocRecord.chassisNo}</div>
                    <div><strong>Engine No:</strong> {nocRecord.engineNo}</div>
                    <div><strong>Valid Until:</strong> {nocRecord.validTill}</div>
                  </div>

                  <div style={{ marginTop: 14, padding: 12, background: "white", borderRadius: 8, fontSize: 12, color: "#065f46" }}>
                    ✓ {nocRecord.remarks}
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                    <button
                      onClick={() => window.print()}
                      style={{
                        flex: 1,
                        background: "#047857",
                        color: "white",
                        border: "none",
                        padding: 12,
                        borderRadius: 8,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      🖨️ {lang === "hi" ? "डिजिटल NOC डाउनलोड करें" : "Download Verified Traffic NOC"}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 24, textAlign: "center", background: "#f8fafc", borderRadius: 8, color: "#64748b" }}>
                  ⚠️ {lang === "hi" ? "इस वाहन के लिए अभी कोई NOC रिकॉर्ड उपलब्ध नहीं है। कृपया पेंडिंग चालान चुकता करें।" : "No cleared Traffic NOC found for this vehicle. Ensure all pending e-Challans are cleared first."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
