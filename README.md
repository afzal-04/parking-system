This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



Business Requirment 

# Business Requirement Document (BRD)
## Smart Traffic & Parking Management System

| Field | Detail |
|---|---|
| Project | Parking Management — Raipur Police Commissionerate Traffic Hackathon 2026 |
| Prepared for | Raipur Police Commissionerate (Traffic Wing) |
| Prepared by | Md Afzal |
| Version | 2.0 (Draft for discussion — scope expanded to 4 modules) |
| Status | Draft |
| Registration | Single submission under the **Parking Management** thematic |

---

## 1. Purpose of the Document

This document defines **what** the solution must do and **why** — before any solution design or technical architecture is finalized. It reflects the expanded scope agreed in this session and forms the basis for the Solution Document (SD) that follows.

---

## 2. Background & Problem Statement

Raipur city, within the Police Commissionerate boundary, faces recurring traffic and parking problems that are currently handled reactively, with no centralized, data-driven visibility for the Traffic Wing:

1. **Encroachment** on main thoroughfares and service lanes.
2. **No-parking zone violations** due to lack of monitoring/enforcement.
3. **Underutilized designated parking zones** — citizens unaware of, or not using, legal parking areas.
4. **Chaotic parking** at bus stands, the railway station, markets, and school zones.
5. **No live visibility into traffic congestion** — police only learn about a jam once it is already severe, and deploy patrols after the fact rather than proactively.
6. **No fast-lane mechanism for emergency vehicles** (ambulance, fire, VIP movement) through congested junctions — delays are handled manually by whichever officer happens to be present.
7. **No structured way to guide citizens to available parking**, so vehicles circle looking for space, adding to congestion.

This is submitted under the **Parking Management** thematic (per hackathon rules, one registration per theme, one form per theme). The scope below covers four modules that together form one cohesive "Smart Traffic & Parking" solution, framed within this single theme.

---

## 3. Business Objectives

| # | Objective |
|---|---|
| O1 | Give citizens a fast way to report parking violations with photo + location evidence |
| O2 | Give Traffic Police a live map of **where complaints are concentrated**, to prioritize enforcement |
| O3 | Give Traffic Police a **live congestion view** of key junctions, to deploy patrols proactively |
| O4 | Provide a mechanism to **reduce emergency-vehicle transit time** through congested junctions |
| O5 | Help citizens and administrators see and manage **real parking capacity**, not just complaints |
| O6 | Convert data into **low-cost, locally implementable** recommendations |
| O7 | Keep the hackathon submission cost-free to run, with an honest, clearly-labelled path from simulated to real data/hardware in production |

---

## 4. Scope — Four Modules

### Module 1: Parking Complaint Map
Citizen-reported violations (encroachment, illegal/no-parking) shown on a **dedicated** map for the police to triage and act on. *(Builds on the reporting portal already in progress.)*

### Module 2: Live Traffic Control Map
A **separate**, dedicated map showing real-time congestion status (Free / Moderate / Heavy) at key junctions across the Commissionerate, so patrols can be sent to a jam as it forms.

### Module 3: Emergency Vehicle Signal Control *(proof-of-concept)*
A proposed workflow where a registered emergency vehicle (ambulance/fire) broadcasts its live location and route; the system identifies upcoming junctions on its path and flags them for **signal preemption** — i.e., an operator dashboard shows "give this junction green priority now."
- **Hackathon-stage reality check:** actually switching physical traffic signals needs hardware integration (signal controller access, RFID/GPS-triggered relays) that a solo hackathon submission cannot deploy on real infrastructure. This module will be delivered as a **working software simulation**: a mock emergency-vehicle tracker + a "signal preemption request" dashboard that shows the concept end-to-end, clearly labelled as a proof-of-concept with a defined hardware integration path for production (see Solution Doc).

### Module 4: Smart Parking Management System
Beyond complaint reporting — a live view of **parking capacity**: designated parking zones marked on the map with an occupancy status (Available / Filling / Full), to guide citizens toward open spaces and reduce circling traffic.
- **Hackathon-stage reality check:** without real IoT occupancy sensors installed in parking bays, live occupancy will also be a **simulated feed** (structurally identical to Module 2's approach), with sensor/camera-based occupancy detection proposed as the production upgrade.

> **Framing for the jury:** Modules 1 and 4 are the most immediately, fully implementable at low cost (signage, marking, a reporting portal). Modules 2 and 3 are presented honestly as working proof-of-concepts with a clear, realistic path to full deployment — this is a strength, not a weakness, if presented transparently.

### 4.1 Out of Scope (for hackathon submission stage)
- Native mobile app (web-based, mobile-responsive only)
- Actual integration with live traffic signal controller hardware
- Actual IoT occupancy sensors in parking bays
- Live CCTV/ANPR camera feeds
- Paid traffic-data providers (TomTom/Google Traffic API) — simulated feed for now, swap-in path documented
- Citizen login/account system — reporting stays anonymous
- Payment/fine collection workflows

---

## 5. Stakeholders

| Stakeholder | Interest |
|---|---|
| Raipur Police Commissionerate — Traffic Wing | Primary admin-dashboard user; enforcement and emergency-corridor decision owner |
| Citizens of Raipur | Reporting-portal users; benefit from better parking guidance |
| Emergency services (ambulance/fire, conceptually) | Beneficiary of Module 3's proposed preemption workflow |
| Hackathon Jury (IEI CG State Centre, Police Commissionerate, NIT Raipur) | Evaluates cost, simplicity, implementability |
| Solution owner/developer | Md Afzal — builds and presents the solution |

---

## 6. Functional Requirements

### FR-1: Citizen Reporting Portal
- FR-1.1: Select violation category (Illegal parking / Encroachment / No-parking zone / Other)
- FR-1.2: Attach photo (optional)
- FR-1.3: Capture location via GPS or manual entry
- FR-1.4: Add free-text description
- FR-1.5: Receive report ID + confirmation on submission
- FR-1.6: See live aggregate stats and a recent-reports feed

### FR-2: Module 1 — Parking Complaint Map
- FR-2.1: All complaints shown as status-colored markers on a dedicated map
- FR-2.2: Marker click shows complaint detail
- FR-2.3: Map scoped to the Commissionerate boundary
- FR-2.4: Filterable complaint table with inline status update

### FR-3: Module 2 — Live Traffic Control Map
- FR-3.1: Major junctions shown as live status markers (Free / Moderate / Heavy)
- FR-3.2: Status auto-updates at a regular interval (simulated feed; pluggable real feed for production)
- FR-3.3: Alert banner when a junction crosses into "Heavy"
- FR-3.4: One-click "Deploy Patrol" action, logged and reflected on the map
- FR-3.5: Side panel listing all junctions with current status and last-updated time

### FR-4: Module 3 — Emergency Vehicle Signal Control (proof-of-concept)
- FR-4.1: Operator can register/simulate an emergency vehicle with a start and destination point
- FR-4.2: System computes the route and identifies junctions along the path
- FR-4.3: Dashboard displays a "preemption request" for each upcoming junction as the vehicle approaches (simulated movement for demo)
- FR-4.4: Each preemption request has a clear status (Requested / Acknowledged / Cleared)
- FR-4.5: All screens clearly label this module as a **proof-of-concept / simulation**, not live control of physical signals

### FR-5: Module 4 — Smart Parking Management System
- FR-5.1: Designated parking zones shown on a map with occupancy status (Available / Filling / Full)
- FR-5.2: Citizen-facing view suggests the nearest available zone
- FR-5.3: Admin view lists zone-wise capacity and current simulated occupancy
- FR-5.4: Occupancy updates on a simulated feed (same pattern as Module 2), clearly labelled

### FR-6: Zone Analytics & Recommendations
- FR-6.1: Rank locations by complaint volume ("Top Zones")
- FR-6.2: Auto-generated low-cost recommendation per top zone with approximate cost

### FR-7: Localization
- FR-7.1: All screens support Hindi and English, switchable at runtime

---

## 7. Non-Functional Requirements

| # | Requirement |
|---|---|
| NFR-1 | Runs on a free-tier hosting stack for the hackathon submission |
| NFR-2 | Mobile-responsive across all citizen-facing screens |
| NFR-3 | Map and dashboard interactions feel immediate on typical 4G |
| NFR-4 | Codebase simple enough for a solo developer to build, demo, and explain live |
| NFR-5 | Visual design aligns with official Raipur Police branding conventions |
| NFR-6 | Every simulated/proof-of-concept element is **clearly labelled as such** in the UI — no feature should imply real hardware control that doesn't exist |

---

## 8. Assumptions

- A1: Jury evaluates working prototypes favorably over slides-only submissions
- A2: Honest, well-scoped proof-of-concepts (Modules 2–4's live-data pieces) are viewed positively when the production path is clearly explained, rather than penalized for not being "fully real"
- A3: The Commissionerate boundary map shared by organizers is the authoritative reference for scoping locations
- A4: A single Parking Management theme registration, covering all 4 modules as one cohesive submission, is an acceptable interpretation of the rules (multi-theme registration was considered and set aside — see Section 4)

---

## 9. Constraints & Known Open Items

- C1: Submissions and data must stay within the Raipur Police Commissionerate boundary
- C2: File uploads capped at 10 MB per the hackathon's submission portal
- C3: **Open item (carried over):** junction/complaint coordinates are manually curated from web search and need a verification pass (manual pin-drop against Google Maps / the official GIS layer) before being finalized in the Solution Doc's data model
- C4: **New open item:** Module 3 and Module 4's live feeds are simulated for the hackathon; the Solution Doc must clearly separate "what works today" from "what the production integration would require," so the demo narrative stays honest

---

## 10. Success Criteria

- Shortlisted among the top 5 entries for the Parking Management theme
- Working live demo covering all 4 modules during the 27 Sep 2026 presentation
- Jury feedback recognizes the solution as ambitious but realistically scoped, with a credible production roadmap

---

## 11. Reference Timeline (Hackathon)

| Milestone | Date |
|---|---|
| Registration opens | 17 Aug 2026 |
| Registration closes | 17 Sep 2026 |
| Shortlist announced | 23–25 Sep 2026 |
| Presentation in Raipur | 27 Sep 2026 |
| Winners felicitated | 1st week of Oct 2026 |

---

## 12. Next Steps

1. Review and discuss this expanded BRD — confirm the 4-module scope and the single-theme registration decision
2. Once agreed, produce the **Solution Document (SD)** covering: system architecture, data model, the four map/module technical designs, API design, and the simulated→real upgrade path for Modules 2, 3, and 4
3. Resume implementation against the agreed Solution Document