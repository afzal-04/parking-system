"use client";

import { useState } from "react";
import { LOST_ARTICLE_TYPES } from "@/lib/kspServicesData";
import { findNearestPoliceStation } from "@/lib/policeStations";

export default function ELostReportModal({ isOpen, onClose, lang = "en" }) {
  const [articleType, setArticleType] = useState(LOST_ARTICLE_TYPES[0].id);
  const [applicantName, setApplicantName] = useState("");
  const [phone, setPhone] = useState("");
  const [lostLocation, setLostLocation] = useState("");
  const [lostDate, setLostDate] = useState("2026-08-24");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!applicantName || !phone || !lostLocation) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const station = findNearestPoliceStation(21.2514, 81.6296);
      const articleObj = LOST_ARTICLE_TYPES.find((a) => a.id === articleType);
      const reportId = `KSP-ELOST-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      setReceipt({
        reportId,
        article: lang === "hi" ? articleObj.hi : articleObj.en,
        applicantName,
        phone,
        lostLocation,
        lostDate,
        details,
        stationName: lang === "hi" ? station.name : station.nameEn,
        generatedAt: new Date().toLocaleString(),
      });
      setIsSubmitting(false);
    }, 1000);
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
          maxWidth: 640,
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
            background: "#0284c7",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#e0f2fe", fontWeight: 700, letterSpacing: "0.1em" }}>
              KARNATAKA POLICE MODEL · DIGITAL CITIZEN SERVICES
            </div>
            <h3 style={{ fontSize: 20, marginTop: 2, color: "white" }}>
              📁 {lang === "hi" ? "इ-लॉस्ट रिपोर्ट (गुमशुदगी शिकायत)" : "e-Lost Article Digital Report"}
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
          {receipt ? (
            <div style={{ background: "#f8fafc", border: "2px dashed #0284c7", borderRadius: 12, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#0284c7" }}>
                  OFFICIAL DIGITAL ACKNOWLEDGEMENT RECEIPT
                </span>
                <span style={{ fontSize: 12, background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: 10, fontWeight: 700 }}>
                  ✓ DIGITALLY VERIFIED
                </span>
              </div>

              <h4 style={{ fontSize: 18, color: "#0f172a", marginBottom: 12 }}>
                Report ID: <strong>{receipt.reportId}</strong>
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13, color: "#334155" }}>
                <div>
                  <strong>Applicant:</strong> {receipt.applicantName}
                </div>
                <div>
                  <strong>Mobile:</strong> {receipt.phone}
                </div>
                <div>
                  <strong>Lost Item:</strong> {receipt.article}
                </div>
                <div>
                  <strong>Lost Date:</strong> {receipt.lostDate}
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <strong>Lost Location:</strong> {receipt.lostLocation}
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <strong>Assigned Station:</strong> {receipt.stationName}
                </div>
              </div>

              <div style={{ marginTop: 16, padding: "10px 14px", background: "#e0f2fe", borderRadius: 8, fontSize: 12, color: "#0369a1" }}>
                ℹ️ {lang === "hi" ? "यह एक डिजिटल पावती है। इसका उपयोग नया DL/RC जारी कराने हेतु अधिकृत प्रमाण पत्र के रूप में किया जा सकता है।" : "This digital report is an authentic proof for re-issuance of lost DL/RC book or insurance claims."}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    flex: 1,
                    background: "var(--navy-900)",
                    color: "white",
                    border: "none",
                    padding: 12,
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  🖨️ {lang === "hi" ? "पावती प्रिंट/डाउनलोड करें" : "Print / Download Receipt"}
                </button>
                <button
                  onClick={() => setReceipt(null)}
                  style={{
                    background: "#e2e8f0",
                    color: "#334155",
                    border: "none",
                    padding: "12px 18px",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {lang === "hi" ? "नया दर्ज करें" : "File Another"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                  {lang === "hi" ? "गुम हुए दस्तावेज/सामान का प्रकार" : "Type of Lost Document / Article"}
                </label>
                <select
                  value={articleType}
                  onChange={(e) => setArticleType(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line-strong)", fontSize: 14 }}
                >
                  {LOST_ARTICLE_TYPES.map((a) => (
                    <option key={a.id} value={a.id}>
                      {lang === "hi" ? a.hi : a.en}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                    {lang === "hi" ? "आवेदक का नाम" : "Applicant Full Name"} *
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line-strong)", fontSize: 14 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                    {lang === "hi" ? "मोबाइल नंबर" : "Mobile Number"} *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line-strong)", fontSize: 14 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                    {lang === "hi" ? "गुम होने का स्थान" : "Lost Location"} *
                  </label>
                  <input
                    type="text"
                    value={lostLocation}
                    onChange={(e) => setLostLocation(e.target.value)}
                    placeholder="e.g. Telibandha Lake Front, Raipur"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line-strong)", fontSize: 14 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                    {lang === "hi" ? "गुम होने की तिथि" : "Date of Loss"}
                  </label>
                  <input
                    type="date"
                    value={lostDate}
                    onChange={(e) => setLostDate(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line-strong)", fontSize: 14 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                  {lang === "hi" ? "अतिरिक्त विवरण (उदा. DL नंबर / फोन IMEI)" : "Additional Details (e.g. DL / RC Number or IMEI)"}
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide document number or description if available..."
                  rows={3}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line-strong)", fontSize: 14 }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: "#0284c7",
                  color: "white",
                  border: "none",
                  padding: "14px 18px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  marginTop: 6,
                }}
              >
                {isSubmitting ? (lang === "hi" ? "रिपोर्ट दर्ज हो रही है..." : "Generating e-Lost Certificate...") : (lang === "hi" ? "📑 ऑनलाइन इ-लॉस्ट रिपोर्ट दर्ज करें" : "📑 File Online e-Lost Report & Get Receipt")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
