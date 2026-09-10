"use client";

import { useState } from "react";
import { PATROL_AREAS } from "@/lib/policeStations";

export default function AddPatrolUnitModal({ isOpen, onClose, onPatrolAdded, stations = [], lang = "en" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    code: "PCR-09",
    callSign: "COBRA-1",
    vehicleNumber: "CG 04 PC 1015",
    vehicleCategory: "pcr_van",
    vehicleType: "Mahindra Bolero 4x4 Mobile PCR",
    name: "",
    nameEn: "",
    areaId: "kotwali",
    stationId: "kotwali-ps",
    stationName: "कोतवाली पुलिस थाना",
    stationNameEn: "Kotwali Police Station",
    officer: "",
    officerRank: "Assistant Sub-Inspector (ASI)",
    officerRankHi: "सहा. उप-निरीक्षक (ASI)",
    mobile: "94791-90015",
    phone: "0771-4287111",
    sector: "",
    sectorEn: "",
    speed: "24 km/h",
    fuelBattery: "95%",
    shift: "24x7 Day/Night Shift",
    lat: "21.2440",
    lng: "81.6340",
  });

  if (!isOpen) return null;

  function handleChange(field, val) {
    setFormData((prev) => ({ ...prev, [field]: val }));
  }

  function handleAreaChange(areaId) {
    const area = PATROL_AREAS.find((a) => a.id === areaId);
    if (area && area.center) {
      setFormData((prev) => ({
        ...prev,
        areaId,
        lat: String(area.center[0]),
        lng: String(area.center[1]),
      }));
    } else {
      handleChange("areaId", areaId);
    }
  }

  function handleStationChange(stationId) {
    const stn = stations.find((s) => s.id === stationId);
    if (stn) {
      setFormData((prev) => ({
        ...prev,
        stationId: stn.id,
        stationName: stn.name,
        stationNameEn: stn.nameEn,
        areaId: stn.areaId || prev.areaId,
        lat: String(stn.lat),
        lng: String(stn.lng),
        phone: stn.phone,
      }));
    }
  }

  function handleCategoryChange(category) {
    let vehicleType = "Mahindra Bolero 4x4 Mobile PCR";
    if (category === "bike_squad") vehicleType = "Bajaj Pulsar 250 Twin Patrol Bike";
    else if (category === "interceptor") vehicleType = "Scorpio High-Speed Highway Interceptor";
    else if (category === "erv") vehicleType = "Toyota Innova Emergency Response Command Van";

    setFormData((prev) => ({
      ...prev,
      vehicleCategory: category,
      vehicleType,
    }));
  }

  function handleUseCurrentLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            lat: pos.coords.latitude.toFixed(5),
            lng: pos.coords.longitude.toFixed(5),
          }));
        },
        () => {
          alert(lang === "hi" ? "लोकेशन प्राप्त नहीं हो सकी।" : "Unable to retrieve location.");
        }
      );
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.code || !formData.vehicleNumber || !formData.officer || !formData.lat || !formData.lng) {
      setError(lang === "hi" ? "कृपया सभी अनिवार्य फ़ील्ड भरें।" : "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const generatedId = `patrol-${formData.code.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now()}`;
      const defaultName = `${formData.callSign} गश्त वाहन (${formData.code})`;
      const defaultNameEn = `${formData.callSign} Patrol Unit (${formData.code})`;

      const payload = {
        ...formData,
        id: generatedId,
        name: formData.name || defaultName,
        nameEn: formData.nameEn || defaultNameEn,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        sector: formData.sector || "निर्धारित सेक्टर गश्त",
        sectorEn: formData.sectorEn || "Designated Sector Patrol",
        status: "on_patrol",
        statusLabel: { hi: "सक्रिय गश्त (Active)", en: "Active Patrol" },
        waypoints: [
          [parseFloat(formData.lat), parseFloat(formData.lng)],
          [parseFloat(formData.lat) + 0.003, parseFloat(formData.lng) + 0.003],
          [parseFloat(formData.lat) - 0.002, parseFloat(formData.lng) - 0.002],
        ],
      };

      const res = await fetch("/api/patrol-units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add patrol unit.");
      }

      if (onPatrolAdded) onPatrolAdded(data.unit);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.7)",
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
          maxWidth: 660,
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            background: "#b91c1c",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#fecaca", fontWeight: 700, letterSpacing: "0.08em" }}>
              PATROL FLEET DISPATCH · VEHICLE ONBOARDING
            </div>
            <h3 style={{ fontSize: 19, marginTop: 2, color: "white" }}>
              🚔 {lang === "hi" ? "नया पेट्रोलिंग वाहन / स्टेशन जोड़ें" : "Register New Patrol Vehicle / Unit"}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "white",
              fontSize: 16,
              borderRadius: "50%",
              width: 32,
              height: 32,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {error && (
            <div style={{ padding: "10px 14px", background: "#fef2f2", color: "#b91c1c", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                {lang === "hi" ? "वाहन कोड (Code) *" : "Vehicle Code *"}
              </label>
              <input
                type="text"
                required
                placeholder="उदा. PCR-09"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13.5, fontFamily: "monospace", fontWeight: 700 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                {lang === "hi" ? "कॉल साइन (Call Sign) *" : "Call Sign *"}
              </label>
              <input
                type="text"
                required
                placeholder="उदा. COBRA-1"
                value={formData.callSign}
                onChange={(e) => handleChange("callSign", e.target.value.toUpperCase())}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13.5, fontFamily: "monospace", fontWeight: 700 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                {lang === "hi" ? "वाहन नंबर (Reg. No.) *" : "Registration Plate *"}
              </label>
              <input
                type="text"
                required
                placeholder="CG 04 PC 1015"
                value={formData.vehicleNumber}
                onChange={(e) => handleChange("vehicleNumber", e.target.value.toUpperCase())}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13.5, fontFamily: "monospace", fontWeight: 700 }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                {lang === "hi" ? "वाहन श्रेणी (Category) *" : "Vehicle Category *"}
              </label>
              <select
                value={formData.vehicleCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13.5 }}
              >
                <option value="pcr_van">🚔 PCR Mobile Van (Bolero/Xenon)</option>
                <option value="bike_squad">🏍️ Cheetah Bike Squad (Twin Pulsar/Bullet)</option>
                <option value="interceptor">🚓 Highway Interceptor (High-Speed)</option>
                <option value="erv">🚨 Emergency Response Unit (ERV)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                {lang === "hi" ? "संबद्ध थाना (Assigned Station)" : "Assigned Police Station"}
              </label>
              <select
                value={formData.stationId}
                onChange={(e) => handleStationChange(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13.5 }}
              >
                {stations.map((stn) => (
                  <option key={stn.id} value={stn.id}>
                    {lang === "hi" ? stn.name : stn.nameEn} ({stn.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                {lang === "hi" ? "ड्यूटी अधिकारी नाम *" : "Duty Officer Name *"}
              </label>
              <input
                type="text"
                required
                placeholder="उदा. ASI Ramesh Sahu"
                value={formData.officer}
                onChange={(e) => handleChange("officer", e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13.5 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                {lang === "hi" ? "अधिकारी मोबाइल नंबर *" : "Officer Mobile *"}
              </label>
              <input
                type="text"
                required
                placeholder="94791-900xx"
                value={formData.mobile}
                onChange={(e) => handleChange("mobile", e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13.5 }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                {lang === "hi" ? "तैनात सेक्टर / क्षेत्र *" : "Patrol Sector *"}
              </label>
              <select
                value={formData.areaId}
                onChange={(e) => handleAreaChange(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13.5 }}
              >
                {PATROL_AREAS.filter((a) => a.id !== "all").map((area) => (
                  <option key={area.id} value={area.id}>
                    {lang === "hi" ? area.name : area.nameEn}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                {lang === "hi" ? "गश्त बीट विवरण (Sector Route)" : "Patrol Beat Route"}
              </label>
              <input
                type="text"
                placeholder="उदा. जयस्तंभ चौक · मालवीय रोड · गोल बाज़ार"
                value={formData.sector}
                onChange={(e) => handleChange("sector", e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13.5 }}
              />
            </div>
          </div>

          <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#b91c1c" }}>
                📍 {lang === "hi" ? "प्रारंभिक GPS स्थिति (Initial Location) *" : "Initial GPS Position *"}
              </span>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#b91c1c",
                  background: "#fee2e2",
                  border: "1px solid #fecaca",
                  padding: "3px 8px",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                📍 Use My GPS
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, color: "#64748b" }}>Latitude (अक्षांश)</span>
                <input
                  type="text"
                  required
                  value={formData.lat}
                  onChange={(e) => handleChange("lat", e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", borderRadius: 4, border: "1px solid #cbd5e1", fontSize: 13, fontFamily: "monospace" }}
                />
              </div>
              <div>
                <span style={{ fontSize: 11, color: "#64748b" }}>Longitude (देशांतर)</span>
                <input
                  type="text"
                  required
                  value={formData.lng}
                  onChange={(e) => handleChange("lng", e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", borderRadius: 4, border: "1px solid #cbd5e1", fontSize: 13, fontFamily: "monospace" }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                background: "white",
                color: "#475569",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {lang === "hi" ? "रद्द करें" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "8px 20px",
                borderRadius: 6,
                border: "none",
                background: "#b91c1c",
                color: "white",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: loading ? "wait" : "pointer",
                boxShadow: "0 2px 8px rgba(185, 28, 28, 0.3)",
              }}
            >
              {loading ? (lang === "hi" ? "जोड़ रहे हैं..." : "Adding...") : (lang === "hi" ? "✓ वाहन पंजीकृत करें" : "✓ Onboard Patrol Unit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
