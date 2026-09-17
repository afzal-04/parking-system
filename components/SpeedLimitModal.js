"use client";

import { SPEED_LIMIT_MATRIX } from "@/lib/dtpServicesData";

export default function SpeedLimitModal({ isOpen, onClose, lang = "en" }) {
  if (!isOpen) return null;

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
          maxWidth: 680,
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
            background: "#b45309",
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
              RAIPUR TRAFFIC POLICE · SPEED SAFETY GUIDANCE
            </div>
            <h3 style={{ fontSize: 20, marginTop: 2, color: "white" }}>
               {lang === "hi" ? "रायपुर शहर गति सीमा दर तालिका" : "Raipur City Speed Limit Matrix"}
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
          <div style={{ marginBottom: 16, fontSize: 13.5, color: "#334155" }}>
            {lang === "hi"
              ? "मोटर वाहन अधिनियम के तहत रायपुर पुलिस कमिश्नरेट क्षेत्र की प्रमुख सड़कों पर निर्धारित अधिकतम गति सीमा:"
              : "Official maximum speed limits enforced across major Raipur road corridors under the Motor Vehicles Act:"}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "10px 12px", color: "#475569" }}>{lang === "hi" ? "सड़क / ज़ोन" : "Road / Zone"}</th>
                  <th style={{ padding: "10px 12px", color: "#1e40af", textAlign: "center" }}> {lang === "hi" ? "कार / LMV" : "Car / LMV"}</th>
                  <th style={{ padding: "10px 12px", color: "#047857", textAlign: "center" }}> {lang === "hi" ? "दुपहिया" : "Two-Wheeler"}</th>
                  <th style={{ padding: "10px 12px", color: "#b91c1c", textAlign: "center" }}> {lang === "hi" ? "भारी वाहन" : "Commercial Truck"}</th>
                </tr>
              </thead>
              <tbody>
                {SPEED_LIMIT_MATRIX.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px", fontWeight: 600, color: "#0f172a" }}>
                      {lang === "hi" ? row.roadTypeHi : row.roadTypeEn}
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 400, marginTop: 2 }}>{row.notes}</div>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center", fontWeight: 700, color: "#1e40af" }}>{row.carLimit}</td>
                    <td style={{ padding: "12px", textAlign: "center", fontWeight: 700, color: "#047857" }}>{row.bikeLimit}</td>
                    <td style={{ padding: "12px", textAlign: "center", fontWeight: 700, color: "#b91c1c" }}>{row.truckLimit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 20, padding: 14, background: "#fffbeb", borderRadius: 8, fontSize: 12, color: "#92400e" }}>
             {lang === "hi" ? "नोट: ओवर-स्पीडिंग पर ₹ 2,000 से ₹ 4,000 तक चालान तथा लाइसेंस निलंबन की कार्रवाई हो सकती है।" : "Note: Over-speeding attracts automatic speed camera e-Challan of ₹2,000 - ₹4,000 and DL suspension."}
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
              {lang === "hi" ? "ठीक है" : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
