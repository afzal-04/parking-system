# 🚦 Parking Suraksha & Smart Traffic System — Raipur Police
### Comprehensive Project Documentation & Technical Architecture Report
**Submission:** Raipur Police Commissionerate · Traffic Hackathon 2026  
**Tech Stack:** Next.js (App Router), React, Vanilla CSS Design System, Leaflet Maps, REST APIs

---

## 📌 Executive Summary

**Parking Suraksha & Smart Traffic System** is an end-to-end civic and municipal policing platform engineered for the **Raipur Police Commissionerate**. It bridges the gap between citizens on the road and traffic police control officers at headquarters.

The platform provides a streamlined, clutter-free **Citizen Portal** for instant traffic violation reporting, real-time GPS parking spot location, live junction traffic monitoring, and 6 digital police desks (e-Challan, e-Lost, Speed Limits, NOC, Taxi Complaint, Fine Guide), seamlessly integrated with an **Admin Command Dashboard** equipped with emergency dispatch, signal preemption, and patrol management.

---

## 🏛️ System Architecture Overview

```mermaid
graph TD
    subgraph "Citizen Interface (Public Portal)"
        CP[Citizen Web Portal] --> CF[Complaint & Emergency Form]
        CP --> PF[Find Parking Near You - GPS]
        CP --> TM[Live Traffic & Parking Map]
        CP --> CS[Citizen Digital Services Modals]
    end

    subgraph "Backend & Processing Layer"
        API[/api/complaints]
        GeoCalc[Haversine Distance Engine]
        StnMatcher[Nearest Police Station Matcher]
    end

    subgraph "Police Command & Control Dashboard"
        AD[Admin Control Center] --> M1[M1: Complaints Triage & Map]
        AD --> M2[M2: Live Traffic Flow & Patrol Deployment]
        AD --> M3[M3: Emergency Vehicle Green Corridor PoC]
        AD --> M4[M4: Smart Parking Capacity Override]
    end

    CF -->|POST /api/complaints| API
    PF -->|GPS Coordinates| GeoCalc
    CF -->|Auto-tag Station| StnMatcher
    API -->|Real-time Triage| M1
    M2 -->|Dispatch Patrol| AD
```

---

## 🚀 The 4 Core Modules

### 1. Module 1: Citizen Parking & Violation Reporting Map
- **Photo & GPS Geo-Tagged Reports:** Citizens can snap a photo, auto-fill high-precision GPS coordinates, select violation category (*Illegal Parking, Encroachment, No-Parking Zone, Accident/Emergency, Other*), and submit in seconds.
- **Accident Emergency Siren Mode:** Selecting "Accident / Emergency" activates emergency dispatch mode, automatically identifying the nearest Raipur Police Station (e.g. *Gol Bazar, Telibandha, Devendra Nagar, Amanaka, Pandri, Civil Lines*) and triggering an audible & visual alarm for instant response.
- **Police Admin Triage:** Filter reports by status (*Pending, In Progress, Resolved*), update workflow statuses, inspect attached photo proofs, and view incident markers directly on the live Leaflet map.

### 2. Module 2: Live Traffic Congestion Control & Patrol Dispatch
- **Live Junction Status:** Real-time monitoring of major Raipur traffic nodes (*Jaistambh Chowk, Telibandha Expressway, Tatibandh Chowk, Ghadi Chowk, Fafadih Chowk, Pandri Cloth Market*).
- **Traffic Level Classification:**
  - 🟢 **Free Flow (सामान्य)** — Normal traffic movement.
  - 🟡 **Moderate (मध्यम)** — Slow-moving traffic.
  - 🔴 **Heavy Jam (भारी जाम)** — Severe congestion.
- **1-Click Patrol Deployment:** When heavy congestion is flagged, officers can deploy a mobile traffic motorcycle patrol to the exact junction with 1 click.

### 3. Module 3: Emergency Vehicle Green Corridor & Signal Priority (PoC)
- **Ambulance & Fire Brigade Live Route Tracking:** Simulated live telemetry of priority emergency vehicles moving across city corridors (e.g., *Ambulance AMB-108 on AIIMS to Mekahara Hospital Corridor*).
- **Automated Signal Preemption:** Upcoming traffic junctions automatically turn green and hold traffic to provide a zero-delay emergency green corridor.
- **Manual Priority Override:** Police control room can manually toggle priority green signals on any junction along the emergency route.

### 4. Module 4: Smart Parking Management & Finder
- **1-Click GPS Parking Finder:** Citizens can tap *"मेरे पास की पार्किंग खोजें (Find Nearest Parking)"* to instantly compute distances to all 7 designated parking hubs in Raipur.
- **Real-Time Capacity & Progress Bars:** Live indicators of available spots, total capacity, percentage occupied, and occupancy status (*Available / Filling Fast / Full*).
- **1-Click Google Maps Navigation:** Every hub includes direct deep-links to launch turn-by-turn Google Maps navigation to the parking entrance.
- **Police Manual Override:** Police officers can manually calibrate and update occupied spot counts during festivals or peak hours.

---

## 🏛️ Digital Police Citizen Services (Navbar & Quick Access)

All auxiliary citizen services open in interactive, lightweight modals without cluttering the main landing page:

| Service | Module / Authority | Features |
| :--- | :--- | :--- |
| **💳 e-Challan Fine Lookup & Payment** | Karnataka State Police (KSP) Model | Search by vehicle registration number (e.g., `CG 04 AB 1234`), view violation details, date, location, amount, and execute 1-click UPI dummy payment with instant downloadable PDF receipt. |
| **📁 e-Lost Article Reporting** | Digital Citizen Desk | Report lost Driving License (DL), RC Book, Mobile Phone, or Wallet. Issues an instant official digital acknowledgement receipt for duplicate document issuance without visiting a police station. |
| **📜 Traffic Fine Rates Guide** | Motor Vehicles Act (MVA) 2026 | Comprehensive, searchable statutory fine schedule with MVA section references, penalty ranges, and license suspension rules. |
| **🏎️ City Speed Limit Matrix** | Delhi Traffic Police (DTP) Model | Road-wise maximum permissible speed limits for Cars, Two-Wheelers, and Heavy Trucks across GE Road, Ring Roads, VIP Airport Expressway, and School Zones. |
| **🛺 TSR / Taxi Refusal Complaint** | Commuter Helpdesk | Online complaint desk for auto-rickshaw or taxi refusal, meter tampering, or excess fare demands for prompt Traffic Inspector action. |
| **📄 Traffic NOC Clearance Verification** | Traffic Clearance Desk | Instant verification of zero-pending challan status and generation of verified Traffic NOC clearance certificates for RTO vehicle transfer. |
| **🚨 24x7 Emergency Helplines** | Raipur Police Contact Desk | Direct shortcuts to WhatsApp Traffic Photo Line (`8750871493`), National Emergency (`112`), Cyber Crime (`1930`), and Women Helpline (`1091`). |

---

## 🌐 Full Bilingual Support (Hindi & English)

Every module, modal, button, advisory ticker, and status indicator supports instantaneous bilingual switching between **English (ENG)** and **Hindi (हिन्दी)** via the global language toggle in the header.

---

## 🔌 API Endpoints Reference

### `GET /api/complaints`
Returns list of all filed citizen reports.
- **Response:** `{ "complaints": [ ... ] }`

### `POST /api/complaints`
Submits a new parking violation or accident emergency report.
- **Body:**
  ```json
  {
    "category": "अवैध पार्किंग",
    "categoryEn": "Illegal parking",
    "location": "Jaistambh Chowk, Raipur",
    "lat": 21.2518,
    "lng": 81.6292,
    "description": "Vehicle parked in no-parking zone blocking traffic",
    "isEmergency": false,
    "nearestStation": { "name": "गोल बाज़ार थाना", "nameEn": "Gol Bazar Police Station" }
  }
  ```

### `PATCH /api/complaints/[id]`
Updates the triage status of a complaint (Admin only).
- **Body:** `{ "status": "in_progress" | "resolved" | "pending" }`

---

## 🛠️ File & Codebase Structure

```
├── app/
│   ├── page.js                     # Citizen Portal Landing Page (Clean & Focused)
│   ├── page.module.css             # Citizen Portal Styling
│   ├── layout.js                   # Root Layout & Metadata
│   ├── globals.css                 # Global CSS Tokens & Gov Theme
│   ├── admin/
│   │   ├── page.js                 # Police Command & Control Dashboard
│   │   └── admin.module.css        # Admin Dashboard Styling
│   ├── tech-functionality/
│   │   ├── page.js                 # Architecture & Hardware Roadmap Page
│   │   └── tech.module.css         # Tech Page Styling
│   └── api/
│       └── complaints/
│           ├── route.js            # GET/POST Complaints Handler
│           └── [id]/route.js       # PATCH Complaint Status Handler
├── components/
│   ├── Navbar.js                   # Sticky Header with "Citizen Services" Dropdown
│   ├── Navbar.module.css           # Header & Dropdown CSS
│   ├── MapView.js                  # Dynamic Interactive Leaflet Map Component
│   ├── TrafficAdvisoryTicker.js    # Live Traffic Alert Marquee / Ticker
│   ├── EChallanModal.js            # e-Challan Fine Search & Payment Modal
│   ├── ELostReportModal.js         # Digital e-Lost Article Report Modal
│   ├── FineRatesModal.js           # Searchable MVA Fine Chart Modal
│   ├── SpeedLimitModal.js          # Road Speed Limits Matrix Modal
│   ├── TaxiComplaintModal.js       # TSR / Taxi Refusal Complaint Modal
│   ├── VehicleNocModal.js          # Traffic NOC Clearance Modal
│   └── StatusBadge.js              # Color-coded Complaint Status Pill
├── data/
│   └── complaints.json             # Seed Data & Persistent File Store
├── lib/
│   ├── i18n.js                     # English / Hindi Dictionary & Translation Engine
│   ├── parkingData.js              # Parking Zones, Occupancy & Haversine Distance Engine
│   ├── trafficData.js              # Traffic Points & Congestion Levels
│   ├── policeStations.js           # Raipur Police Stations Coordinates & Matching Algorithm
│   ├── kspServicesData.js          # Mock Challans, Fine Rates & Advisories
│   └── dtpServicesData.js          # Speed Limits & Taxi Violation Data
└── public/                         # Static Assets & Icons
```

---

## 🔮 Production Hardware Integration Roadmap

| Module | Hackathon Prototype (PoC) | Production Integration Plan |
| :--- | :--- | :--- |
| **M1: Complaints** | Web photo upload & browser Geolocation API | WhatsApp Bot webhook + mobile patrol app integration with push notification. |
| **M2: Live Traffic** | Live simulation engine with junction levels | Integration with ITMS ANPR camera feeds & inductive loop sensors. |
| **M3: Emergency Signals**| Corridor preemption simulation dashboard | Direct connection to SCATS / UTC Traffic Signal Controllers via NTCIP protocol. |
| **M4: Smart Parking** | Real-time capacity simulation with manual override | Ultrasonic / Magnetometer in-ground sensors & barrier gate FASTag integration. |

---
*Developed for Raipur Police Commissionerate · Traffic Hackathon 2026*
