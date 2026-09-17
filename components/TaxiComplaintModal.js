"use client";

import { useState } from "react";

export default function TaxiComplaintModal({ isOpen, onClose, lang = "en" }) {
  const [vehicleNo, setVehicleNo] = useState("");
  const [complaintType, setComplaintType] = useState("overcharging");
  const [pickupLoc, setPickupLoc] = useState("");
  const [dropLoc, setDropLoc] = useState("");
  const [commuterPhone, setCommuterPhone] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!vehicleNo || !commuterPhone || !pickupLoc) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const caseId = `RAIPUR-TSR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setReceipt({
        caseId,
        vehicleNo: vehicleNo.toUpperCase(),
        complaintType,
        pickupLoc,
        dropLoc,
        phone: commuterPhone,
        description,
        timestamp: new Date().toLocaleString(),
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
          maxWidth: 600,
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
            background: "#4338ca",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#c7d2fe", fontWeight: 700, letterSpacing: "0.1em" }}>
              RAIPUR TRAFFIC POLICE · TSR & TAXI COMPLAINT
            </div>
            <h3 style={{ fontSize: 20, marginTop: 2, color: "white" }}>
               {lang === "hi" ? "ऑटो / टैक्सि मनाही व ओवरचार्जिंग शिकायत" : "Auto / Taxi Refusal & Overcharging Complaint"}
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
            <div style={{ background: "#eef2ff", border: "2px dashed #4338ca", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#4338ca" }}>
                  OFFICIAL TRAFFIC POLICE CASE FILED
                </span>
                <span style={{ fontSize: 12, background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: 10, fontWeight: 700 }}>
                   DISPATCHED TO TRAFFIC INSPECTOR
                </span>
              </div>

              <h4 style={{ fontSize: 18, color: "#0f172a", marginBottom: 10 }}>
                Case ID: <strong>{receipt.caseId}</strong>
              </h4>

              <div style={{ fontSize: 13, color: "#334155", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <strong>Vehicle No:</strong> {receipt.vehicleNo}
                </div>
                <div>
                  <strong>Commuter Mobile:</strong> {receipt.phone}
                </div>
                <div>
                  <strong>Violation Type:</strong> {receipt.complaintType}
                </div>
                <div>
                  <strong>Pickup Point:</strong> {receipt.pickupLoc}
                </div>
              </div>

              <div style={{ marginTop: 14, padding: 12, background: "#fff", borderRadius: 8, fontSize: 12, color: "#3730a3" }}>
                 {lang === "hi" ? "आपकी शिकायत निकटतम ट्रैफिक इंस्पेक्टर व कंट्रोल रूम को प्रेषित कर दी गई है। ऑटो/कैब पर धारा 177 MVA के तहत कार्रवाई की जाएगी।" : "Your complaint has been forwarded to the Traffic Inspector circle. Action will be taken under MVA 177."}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button
                  onClick={() => setReceipt(null)}
                  style={{
                    flex: 1,
                    background: "#4338ca",
                    color: "white",
                    border: "none",
                    padding: 12,
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {lang === "hi" ? "एक और शिकायत दर्ज करें" : "Lodge Another Complaint"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                  {lang === "hi" ? "ऑटो / टैक्सि / कैब नंबर" : "Auto / Taxi / Cab Registration No."} *
                </label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="e.g. CG 04 TA 4321 or CG 04 T 9988"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line-strong)", fontSize: 14, textTransform: "uppercase" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                  {lang === "hi" ? "शिकायत का प्रकार" : "Complaint Category"}
                </label>
                <select
                  value={complaintType}
                  onChange={(e) => setComplaintType(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line-strong)", fontSize: 14 }}
                >
                  <option value="overcharging">{lang === "hi" ? "अधिक किराया माँगना (Overcharging)" : "Overcharging / Excess Fare Demand"}</option>
                  <option value="refusal">{lang === "hi" ? "सवारी ले जाने से मना करना (Refusal to Ply)" : "Refusal to Ply / Refusal of Ride"}</option>
                  <option value="misbehavior">{lang === "hi" ? "चालक का दुर्व्यवहार (Driver Misbehavior)" : "Driver Misbehavior / Rude Conduct"}</option>
                  <option value="meter_tamper">{lang === "hi" ? "मीटरीकरण उल्लंघन / मीटर न चलाना" : "Meter Tampering / Meter Refusal"}</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                    {lang === "hi" ? "पिकअप स्थान" : "Pickup Location"} *
                  </label>
                  <input
                    type="text"
                    value={pickupLoc}
                    onChange={(e) => setPickupLoc(e.target.value)}
                    placeholder="e.g. Railway Station Raipur"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line-strong)", fontSize: 14 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                    {lang === "hi" ? "गंतव्य स्थान" : "Destination (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={dropLoc}
                    onChange={(e) => setDropLoc(e.target.value)}
                    placeholder="e.g. Pandri Market"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line-strong)", fontSize: 14 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                  {lang === "hi" ? "आपका मोबाइल नंबर" : "Your Mobile Number"} *
                </label>
                <input
                  type="tel"
                  value={commuterPhone}
                  onChange={(e) => setCommuterPhone(e.target.value)}
                  placeholder="10-digit phone number"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line-strong)", fontSize: 14 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                  {lang === "hi" ? "घटना का संक्षेप विवरण" : "Incident Brief Description"}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly state what happened..."
                  rows={3}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line-strong)", fontSize: 14 }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: "#4338ca",
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
                {isSubmitting ? (lang === "hi" ? "शिकायत दर्ज हो रही है..." : "Filing Complaint...") : (lang === "hi" ? " ऑटो/टैक्सि शिकायत दर्ज करें" : " Submit Auto / Taxi Complaint")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
