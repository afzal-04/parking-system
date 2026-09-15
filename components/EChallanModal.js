"use client";

import { useState } from "react";
import { MOCK_CHALLANS } from "@/lib/kspServicesData";
import { t } from "@/lib/i18n";

export default function EChallanModal({ isOpen, onClose, lang = "en" }) {
  const [query, setQuery] = useState("CG 04 AB 1234");
  const [results, setResults] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [payingChallanNo, setPayingChallanNo] = useState(null);
  const [paySuccess, setPaySuccess] = useState(null);

  if (!isOpen) return null;

  function handleSearch(e) {
    e.preventDefault();
    const cleanQuery = query.trim().toUpperCase();
    const matched = MOCK_CHALLANS.filter(
      (c) =>
        c.vehicleNo.replaceAll(" ", "").includes(cleanQuery.replaceAll(" ", "")) ||
        c.challanNo.toUpperCase().includes(cleanQuery)
    );
    setResults(matched);
    setHasSearched(true);
    setPaySuccess(null);
  }

  function handlePay(challanNo) {
    setPayingChallanNo(challanNo);
    setTimeout(() => {
      setResults((prev) =>
        prev.map((c) =>
          c.challanNo === challanNo
            ? { ...c, status: "PAID", paidOn: new Date().toISOString().replace("T", " ").slice(0, 16) }
            : c
        )
      );
      setPayingChallanNo(null);
      setPaySuccess(challanNo);
    }, 1200);
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
            background: "var(--navy-900)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "var(--amber)", fontWeight: 700, letterSpacing: "0.1em" }}>
              POLICE MODEL · E-CHALLAN HUB
            </div>
            <h3 style={{ fontSize: 20, marginTop: 2, color: "white" }}>
              💳 {lang === "hi" ? "इ-चालान ई-भुगतान व खोज" : "e-Challan Lookup & Payment"}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
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
              placeholder={lang === "hi" ? "वाहन क्र. (उदा. CG 04 AB 1234) या चालान नं." : "Vehicle No. (e.g. CG 04 AB 1234) or Challan ID"}
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
                background: "var(--navy-900)",
                color: "white",
                border: "none",
                padding: "0 22px",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              🔍 {lang === "hi" ? "खोजें" : "Search"}
            </button>
          </form>

          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
            💡 {lang === "hi" ? "ट्राय करें: " : "Try sample vehicles: "}{" "}
            <span
              style={{ cursor: "pointer", textDecoration: "underline", color: "#0284c7", fontWeight: 600 }}
              onClick={() => setQuery("CG 04 AB 1234")}
            >
              CG 04 AB 1234
            </span>{" "}
            |{" "}
            <span
              style={{ cursor: "pointer", textDecoration: "underline", color: "#0284c7", fontWeight: 600 }}
              onClick={() => setQuery("CG 04 XY 9876")}
            >
              CG 04 XY 9876
            </span>
          </div>

          {paySuccess && (
            <div
              style={{
                padding: "12px 16px",
                background: "#dcfce7",
                border: "1px solid #22c55e",
                borderRadius: 8,
                color: "#15803d",
                fontSize: 13,
                marginBottom: 16,
                fontWeight: 600,
              }}
            >
              ✓ {lang === "hi" ? `चालान #${paySuccess} का सफलतापूर्व ई-भुगतान संपन्न हुआ!` : `e-Challan #${paySuccess} paid successfully! Electronic receipt generated.`}
            </div>
          )}

          {hasSearched && (
            <div>
              {results.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", background: "#f8fafc", borderRadius: 8, color: "#64748b" }}>
                  🎉 {lang === "hi" ? "इस वाहन/चालान पर कोई बकाया जुर्माना नहीं पाया गया।" : "No pending e-Challan violations found for this vehicle."}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {results.map((c) => (
                    <div
                      key={c.challanNo}
                      style={{
                        border: "1px solid var(--line)",
                        borderRadius: 10,
                        padding: 16,
                        background: c.status === "PAID" ? "#f8fafc" : "#fff",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <strong style={{ fontSize: 15, color: "#0f172a" }}>{c.vehicleNo}</strong>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            Challan #: <strong>{c.challanNo}</strong> · Owner: {c.ownerName}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "4px 10px",
                            borderRadius: 12,
                            background: c.status === "PAID" ? "#dcfce7" : "#fee2e2",
                            color: c.status === "PAID" ? "#166534" : "#991b1b",
                          }}
                        >
                          ● {c.status}
                        </span>
                      </div>

                      <div style={{ fontSize: 13, color: "#334155", margin: "8px 0" }}>
                        ⚠️ <strong>{lang === "hi" ? c.violation : c.violationEn}</strong>
                        <br />
                        📍 {c.location} · 🕒 {c.date}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 12,
                          paddingTop: 10,
                          borderTop: "1px dashed #e2e8f0",
                        }}
                      >
                        <div>
                          <span style={{ fontSize: 12, color: "#64748b" }}>{lang === "hi" ? "जुर्माना राशि: " : "Fine Amount: "}</span>
                          <strong style={{ fontSize: 18, color: "var(--navy-900)" }}>₹ {c.amount}</strong>
                        </div>

                        {c.status === "PENDING" ? (
                          <button
                            onClick={() => handlePay(c.challanNo)}
                            disabled={payingChallanNo === c.challanNo}
                            style={{
                              background: "#166534",
                              color: "white",
                              border: "none",
                              padding: "8px 16px",
                              borderRadius: 8,
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {payingChallanNo === c.challanNo ? (lang === "hi" ? "भुगतान हो रहा है..." : "Processing Payment...") : (lang === "hi" ? "💳 अभी ई-भुगतान करें (UPI)" : "💳 Pay Now via UPI / NetBanking")}
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: "#166534", fontWeight: 600 }}>
                            ✓ Paid on {c.paidOn}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
