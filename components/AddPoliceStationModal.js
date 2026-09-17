"use client";

import { useState } from "react";
import { PATROL_AREAS } from "@/lib/policeStations";

export default function AddPoliceStationModal({ isOpen, onClose, onStationAdded, lang = "en" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    code: "",
    areaId: "kotwali",
    address: "",
    addressEn: "",
    jurisdiction: "",
    jurisdictionEn: "",
    inCharge: "",
    inChargeRank: "Station House Officer (SHO)",
    inChargeRankHi: "थाना प्रभारी (टी.आई.)",
    phone: "0771-4287",
    emergencyPhone: "112",
    assignedPatrol: "PCR-NEW",
    lat: "21.2460",
    lng: "81.6360",
  });

  if (!isOpen) return null;

  function handleChange(field, val) {
    setFormData((prev) => ({ ...prev, [field]: val }));
  }

  function handleAutoFillAreaCoordinates(areaId) {
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
    if (!formData.name || !formData.code || !formData.lat || !formData.lng) {
      setError(lang === "hi" ? "कृपया सभी अनिवार्य फ़ील्ड भरें।" : "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const generatedId = `station-${formData.code.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now()}`;
      const payload = {
        ...formData,
        id: generatedId,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        nameEn: formData.nameEn || formData.name,
        addressEn: formData.addressEn || formData.address,
        jurisdictionEn: formData.jurisdictionEn || formData.jurisdiction,
        status: "open_24x7",
        statusLabel: { hi: "24x7 खुला", en: "24x7 Active" },
      };

      const res = await fetch("/api/police-stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add police station.");
      }

      if (onStationAdded) onStationAdded(data.station);
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
          maxWidth: 640,
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
            background: "#1e3a8a",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#93c5fd", fontWeight: 700, letterSpacing: "0.08em" }}>
              RAIPUR POLICE COMMISSIONERATE · REGISTRATION PORTAL
            </div>
            <h3 style={{ fontSize: 19, marginTop: 2, color: "white" }}>
               {lang === "hi" ? "नया पुलिस थाना पंजीकृत करें" : "Register New Police Station"}
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
               {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                {lang === "hi" ? "थाने का नाम (हिंदी) *" : "Station Name (Hindi) *"}
              </label>
              <input
                type="text"
                required
                placeholder="उदा. कचना पुलिस थाना"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13.5 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                {lang === "hi" ? "थाने का नाम (अंग्रेज़ी)" : "Station Name (English)"}
              </label>
              <input
                type="text"
                placeholder="e.g. Kachna Police Station"
                value={formData.nameEn}
                onChange={(e) => handleChange("nameEn", e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13.5 }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                {lang === "hi" ? "थाना कोड (Station Code) *" : "Station Code *"}
              </label>
              <input
                type="text"
                required
                placeholder="उदा. PS-KCH"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13.5, fontFamily: "monospace", fontWeight: 700 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                {lang === "hi" ? "प्रशासनिक सेक्टर / क्षेत्र *" : "Sector / Area *"}
              </label>
              <select
                value={formData.areaId}
                onChange={(e) => handleAutoFillAreaCoordinates(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13.5 }}
              >
                {PATROL_AREAS.filter((a) => a.id !== "all").map((area) => (
                  <option key={area.id} value={area.id}>
                    {lang === "hi" ? area.name : area.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                {lang === "hi" ? "थाना प्रभारी (SHO / TI) नाम" : "In-Charge Officer Name"}
              </label>
              <input
                type="text"
                placeholder="उदा. Ins. K. R. Baghel"
                value={formData.inCharge}
                onChange={(e) => handleChange("inCharge", e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13.5 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                {lang === "hi" ? "आधिकारिक फोन नंबर" : "Official Phone Number"}
              </label>
              <input
                type="text"
                placeholder="0771-4287xxx"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13.5 }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
              {lang === "hi" ? "पता / लोकेशन (Address)" : "Address"}
            </label>
            <input
              type="text"
              placeholder="उदा. कचना मुख्य मार्ग, खम्हारडीह के पास, रायपुर"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13.5 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
              {lang === "hi" ? "कार्यक्षेत्र / अधिकार क्षेत्र (Jurisdiction)" : "Jurisdiction Covered"}
            </label>
            <input
              type="text"
              placeholder="उदा. कचना, खम्हारडीह, अवंती विहार विस्तार"
              value={formData.jurisdiction}
              onChange={(e) => handleChange("jurisdiction", e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13.5 }}
            />
          </div>

          <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1e3a8a" }}>
                 {lang === "hi" ? "मानचित्र GPS निर्देशांक (Latitude & Longitude) *" : "Map GPS Coordinates *"}
              </span>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#0284c7",
                  background: "#e0f2fe",
                  border: "1px solid #bae6fd",
                  padding: "3px 8px",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                 Use My GPS
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
                background: "#1e3a8a",
                color: "white",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: loading ? "wait" : "pointer",
                boxShadow: "0 2px 8px rgba(30, 58, 138, 0.3)",
              }}
            >
              {loading ? (lang === "hi" ? "पंजीकृत हो रहा है..." : "Registering...") : (lang === "hi" ? " थाना पंजीकृत करें" : " Register Station")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
