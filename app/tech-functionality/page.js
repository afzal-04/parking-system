"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import styles from "./tech.module.css";

export default function TechFunctionalityPage() {
  const [lang, setLang] = useState("en");

  return (
    <div className={styles.shell}>
      <Navbar lang={lang} onLangChange={setLang} />
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Technical Architecture &amp; Specifications</div>
          <h1 className={styles.heroTitle}>
            {lang === "hi" ? "रायपुर पार्किंग सेतु - तकनीकी कार्यप्रणाली" : "Raipur Parking Setu - Technical Architecture"}
          </h1>
          <p className={styles.heroSub}>
            {lang === "hi" ? "रायपुर पुलिस कमिश्नरेट ट्रैफिक हैकाथॉन 2026 - विस्तृत तकनीकी दस्तावेज़" : "Raipur Police Commissionerate Traffic Hackathon 2026 - Complete Technical Reference for Judges"}
          </p>
          <div className={styles.submissionBadge}>
            <span> {lang === "hi" ? "सबमिशन में शामिल: माह 1 + माह 2" : "In this submission: Month 1 + Month 2"}</span>
            <span> {lang === "hi" ? "रोडमैप: माह 3 + माह 4+" : "Roadmap: Month 3 + Month 4+"}</span>
          </div>
        </div>
      </section>
      <main className={styles.main}>

        {/* PROBLEM STATEMENT */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2> {lang === "hi" ? "समस्या विवरण" : "Problem Statement"}</h2>
            <p>{lang === "hi" ? "रायपुर की ट्रैफिक व पार्किंग चुनौतियाँ जो इस समाधान को प्रेरित करती हैं" : "The traffic and parking challenges in Raipur that motivated this solution"}</p>
          </div>
          <div className={styles.problemGrid}>
            {[
              { icon: "", title: lang === "hi" ? "मुख्य सड़कों पर अतिक्रमण" : "Encroachment on main roads", desc: lang === "hi" ? "मुख्य सड़कों व सर्विस लेन पर अतिक्रमण की कोई निगरानी नहीं।" : "Main roads and service lanes encroached with no systematic monitoring or enforcement." },
              { icon: "", title: lang === "hi" ? "नो-पार्किंग उल्लंघन" : "No-parking zone violations", desc: lang === "hi" ? "नो-पार्किंग ज़ोन का उल्लंघन बिना रिपोर्ट और कार्रवाई के होता रहता है।" : "No-parking zone violations go unreported and unnoticed, with no data trail for enforcement." },
              { icon: "", title: lang === "hi" ? "कानूनी पार्किंग की अनजानी स्थिति" : "Legal parking underused", desc: lang === "hi" ? "नागरिकों को कानूनी पार्किंग स्थल पता नहीं होते।" : "Legal parking zones are underused because citizens have no way to find nearby availability." },
              { icon: "", title: lang === "hi" ? "पुलिस के पास डेटा नहीं" : "No data-driven police view", desc: lang === "hi" ? "पुलिस के पास शिकायतों के स्थानों का कोई लाइव डेटा-आधारित दृश्य नहीं।" : "Police have no live, data-driven view of where complaints concentrate or where to deploy." },
              { icon: "", title: lang === "hi" ? "आपातकाल की कोई रिपोर्टिंग नहीं" : "No structured emergency reporting", desc: lang === "hi" ? "सड़क दुर्घटना की आपातकालीन सूचना देने का कोई संरचित मार्ग नहीं।" : "No structured path for a citizen to report a roadside emergency with location auto-tagging." },
              { icon: "", title: lang === "hi" ? "कैमरा तैनाती की प्राथमिकता नहीं" : "No camera deployment priority", desc: lang === "hi" ? "कैमरा-आधारित प्रवर्तन के लिए प्राथमिकता तय करने का कोई व्यवस्थित तरीका नहीं।" : "No systematic, data-backed way to prioritize where camera-based enforcement should go." },
            ].map((p, i) => (
              <div key={i} className={styles.problemCard}>
                <span className={styles.problemIcon}>{p.icon}</span>
                <div><strong>{p.title}</strong><p>{p.desc}</p></div>
              </div>
            ))}
          </div>
        </section>

        {/* SYSTEM ARCHITECTURE */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2> {lang === "hi" ? "सिस्टम आर्किटेक्चर" : "System Architecture"}</h2>
            <p>{lang === "hi" ? "नागरिक ऐप एक इंटरफेस लेयर है — मॉड्यूल नहीं। दोनों मॉड्यूल इसके माध्यम से सुलभ हैं।" : "Citizen App is the interface layer — not a numbered module. Both modules are accessed through it."}</p>
          </div>
          <div className={styles.archCard}>
            <div className={styles.archPlatform}>
              <div className={styles.archPlatformBox}>
                <span className={styles.archPlatformIcon}></span>
                <div>
                  <strong>{lang === "hi" ? "नागरिक ऐप (इंटरफेस लेयर)" : "CITIZEN APP (Interface Layer)"}</strong>
                  <div className={styles.archPlatformDesc}>{lang === "hi" ? "उल्लंघन रिपोर्टिंग · पार्किंग खोज · आपातकाल · द्विभाषी" : "Violation reporting · Find parking · Emergency · Bilingual (Hindi/English)"}</div>
                </div>
              </div>
            </div>
            <div className={styles.archArrow}>↓</div>
            <div className={styles.archModuleRow}>
              <div className={`${styles.archModuleBox} ${styles.mod1Box}`}>
                <span className={styles.archModuleNum}></span>
                <strong>{lang === "hi" ? "स्मार्ट पार्किंग सिस्टम" : "Smart Parking System"}</strong>
                <ul>
                  <li>{lang === "hi" ? "पार्किंग स्थलों की सूची" : "Parking inventory"}</li>
                  <li>{lang === "hi" ? "लाइव उपलब्धता ट्रैकिंग" : "Live occupancy tracking"}</li>
                  <li>{lang === "hi" ? "नागरिक पार्किंग खोज" : "Citizen find-parking flow"}</li>
                </ul>
              </div>
              <div className={`${styles.archModuleBox} ${styles.mod2Box}`}>
                <span className={styles.archModuleNum}></span>
                <strong>{lang === "hi" ? "AI अवैध पार्किंग डिटेक्शन" : "AI Illegal Parking Detection"}</strong>
                <ul>
                  <li>{lang === "hi" ? "प्राथमिकता-स्कोर्ड हॉटस्पॉट" : "Priority-scored hotspots"}</li>
                  <li>{lang === "hi" ? "कैमरा + ANPR पाइपलाइन" : "Camera + ANPR pipeline"}</li>
                  <li>{lang === "hi" ? "चरणबद्ध प्रवर्तन" : "Staged enforcement workflow"}</li>
                </ul>
              </div>
            </div>
            <div className={styles.archArrow}>↓</div>
            <div className={styles.archDbRow}><div className={styles.archDbBox}> {lang === "hi" ? "केंद्रीय डेटाबेस" : "Central Database"}</div></div>
            <div className={styles.archArrow}>↓</div>
            <div className={styles.archAdminBox}> {lang === "hi" ? "पुलिस / एडमिन कमांड डैशबोर्ड" : "Admin / Police Command Dashboard"}</div>
          </div>
        </section>

        {/* CITIZEN APP DETAIL */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.platformBadge}>PLATFORM LAYER</span>
            <h2> {lang === "hi" ? "नागरिक ऐप — विस्तृत विवरण" : "Citizen App — Detail"}</h2>
            <p>{lang === "hi" ? "नागरिक ऐप वह एकल वेब एप्लिकेशन है जिसके माध्यम से नागरिक हर सेवा तक पहुँचते हैं।" : "The single web application through which citizens access every service. Not a numbered module."}</p>
          </div>
          <div className={styles.flowGrid}>
            <div className={styles.flowCard}>
              <div className={styles.flowCardHead}> {lang === "hi" ? "रिपोर्टिंग फ्लो" : "Reporting Flow"}</div>
              <div className={styles.flowSteps}>
                {["Select category (Illegal Parking / Encroachment / No-Parking Zone / Emergency / Other)", "Upload photo (camera capture or gallery)", "GPS location or manual landmark", "Add description", "Submit → Report ID confirmation"].map((s, i) => (
                  <div key={i} className={styles.flowStep}><span className={styles.flowStepNum}>{i + 1}</span><span>{lang === "hi" ? ["श्रेणी चुनें (अवैध पार्किंग / अतिक्रमण / नो-पार्किंग ज़ोन / आपातकाल / अन्य)", "फोटो अपलोड (कैमरा कैप्चर या गैलरी)", "GPS लोकेशन या मैन्युअल लैंडमार्क", "विवरण जोड़ें", "सबमिट करें → रिपोर्ट ID पुष्टि"][i] : s}</span></div>
                ))}
              </div>
              <div className={styles.flowNote}>ℹ {lang === "hi" ? "शिकायत सूची या मैप कभी सार्वजनिक नहीं — जानबूझकर न्यूनतम नागरिक अनुभव।" : "No complaint list or map is ever shown publicly — intentionally minimal citizen experience."}</div>
            </div>
            <div className={styles.flowCard}>
              <div className={styles.flowCardHead}> {lang === "hi" ? "आपातकाल फ्लो" : "Emergency Flow"}</div>
              <div className={styles.flowSteps}>
                {["Selecting \"Emergency\" auto-tags nearest police station", "High-priority alert raised on admin dashboard", "Operator confirms → alert forwarded toward ambulance dispatch"].map((s, i) => (
                  <div key={i} className={styles.flowStep}><span className={styles.flowStepNum}>{i + 1}</span><span>{lang === "hi" ? ["\"आपातकाल\" श्रेणी — नजदीकी थाना स्वतः टैग", "एडमिन डैशबोर्ड पर हाई-प्रायोरिटी अलर्ट", "ऑपरेटर पुष्टि → एम्बुलेंस की दिशा में अलर्ट"][i] : s}</span></div>
                ))}
              </div>
              <div className={styles.flowNote}> <strong>{lang === "hi" ? "सॉफ्टवेयर सिमुलेशन:" : "Software simulation:"}</strong> {lang === "hi" ? "इस चरण में कोई वास्तविक एम्बुलेंस डिस्पैच सिस्टम एकीकरण नहीं है।" : "No real ambulance dispatch system integration exists at this stage."}</div>
            </div>
            <div className={styles.flowCard}>
              <div className={styles.flowCardHead}> {lang === "hi" ? "पार्किंग खोज फ्लो" : "Find-Parking Flow"}</div>
              <div className={styles.flowSteps}>
                {["GPS-based search of nearby legal parking", "Show distance, availability, hourly rate, hours", "One-tap navigation"].map((s, i) => (
                  <div key={i} className={styles.flowStep}><span className={styles.flowStepNum}>{i + 1}</span><span>{lang === "hi" ? ["GPS-आधारित निकटतम कानूनी पार्किंग खोज", "दूरी, उपलब्धता, दर, संचालन समय दिखाएं", "एक-टैप नेवीगेशन"][i] : s}</span></div>
                ))}
              </div>
            </div>
            <div className={styles.flowCard}>
              <div className={styles.flowCardHead}> {lang === "hi" ? "द्विभाषी समर्थन" : "Bilingual Support"}</div>
              <p style={{ fontSize: "13.5px", color: "#334155", lineHeight: 1.6 }}>{lang === "hi" ? "हर स्क्रीन हिंदी और अंग्रेजी में उपलब्ध है, जिसे कभी भी स्विच किया जा सकता है। सभी फॉर्म लेबल, मानचित्र कैप्शन, स्थिति संकेतक और सहायता पाठ दोनों भाषाओं में उपलब्ध हैं।" : "Every screen supports Hindi and English, switchable instantly without page reload. All form labels, map captions, status indicators, and help text are bilingual."}</p>
            </div>
          </div>
        </section>

        {/*  */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={`${styles.moduleBadge} ${styles.mod1Badge}`}></span>
            <h2> {lang === "hi" ? "स्मार्ट पार्किंग सिस्टम — विस्तृत विवरण" : "Smart Parking System — Detail"}</h2>
            <p>{lang === "hi" ? "नागरिकों को कानूनी पार्किंग खोजने में मदद करता है। नागरिक ऐप के माध्यम से वितरित।" : "Helps citizens find and use legal parking. Delivered through the Citizen App."}</p>
          </div>
          <div className={styles.moduleDetailGrid}>
            <div className={styles.detailCard}>
              <h3> {lang === "hi" ? "डेटा मॉडल — ParkingLocation" : "Data Model — ParkingLocation"}</h3>
              <div className={styles.dataModelGrid}>
                {[["ParkingId", "Unique location identifier", "अद्वितीय स्थान ID"], ["Name", "Parking location name", "पार्किंग स्थल का नाम"], ["Latitude / Longitude", "GIS coordinates", "GIS निर्देशांक"], ["Address", "Full postal address", "पूर्ण पता"], ["Capacity", "Total vehicle capacity", "कुल वाहन क्षमता"], ["ParkingType", "Type (Paid/Free/Commercial etc.)", "प्रकार (भुगतान/निःशुल्क/वाणिज्यिक आदि)"], ["HourlyRate", "Rate per hour (₹)", "प्रति घंटा दर (₹)"], ["OperatingHours", "Operating hours", "संचालन समय"], ["Status", "Available / Filling / Full", "उपलब्ध / भर रहा है / पूर्ण"]].map(([field, en, hi], i) => (
                  <div key={i} className={styles.dataRow}><code>{field}</code><span>{lang === "hi" ? hi : en}</span></div>
                ))}
              </div>
              <div className={styles.detailNote}>{lang === "hi" ? "श्रेणियाँ: भुगतान, निःशुल्क, वाणिज्यिक, दो-पहिया, चार-पहिया, दिव्यांग, नो-पार्किंग" : "Categories: Paid, Free, Commercial, Two-Wheeler, Four-Wheeler, Disabled, No Parking"}</div>
            </div>
            <div className={styles.detailCard}>
              <h3> {lang === "hi" ? "चरणबद्ध ऑक्युपेंसी डिटेक्शन" : "Staged Occupancy Detection Rollout"}</h3>
              <div className={styles.stageList}>
                <div className={styles.stageItem}>
                  <div className={styles.stageHeader}><span className={`${styles.stageBadge} ${styles.stageLive}`}>{lang === "hi" ? "वर्तमान MVP" : "Current MVP"}</span><strong>{lang === "hi" ? "चरण 1: मैन्युअल" : "Stage 1 — Manual"}</strong></div>
                  <p>{lang === "hi" ? "ऑपरेटर-अपडेट किए गए उपलब्ध/भरे स्थान काउंट। लागत: ~₹10/स्थल।" : "Operator-updated occupied/available counts. Cost: ~₹10/site."}</p>
                </div>
                <div className={styles.stageItem}>
                  <div className={styles.stageHeader}><span className={`${styles.stageBadge} ${styles.stageRoadmap}`}>{lang === "hi" ? "रोडमैप" : "Roadmap"}</span><strong>{lang === "hi" ? "चरण 2: IR सेंसर + IoT" : "Stage 2 — IR Sensor + IoT"}</strong></div>
                  <p>{lang === "hi" ? "प्रति-स्लॉट TCRT5000 इन्फ्रारेड सेंसर + NodeMCU/ESP8266 MQTT के माध्यम से क्लाउड को डेटा भेजता है। लागत: ~₹100-150/स्लॉट।" : "Per-slot TCRT5000 infrared sensor + NodeMCU/ESP8266 pushing data to cloud via MQTT. Cost: ~₹100-150/slot."}</p>
                </div>
                <div className={styles.stageItem}>
                  <div className={styles.stageHeader}><span className={`${styles.stageBadge} ${styles.stageRoadmap}`}>{lang === "hi" ? "रोडमैप" : "Roadmap"}</span><strong>{lang === "hi" ? "चरण 3: कैमरा-आधारित" : "Stage 3 — Camera-based"}</strong></div>
                  <p>{lang === "hi" ? "खुले/अचिह्नित लॉट के लिए विज़न डिटेक्शन।" : "Vision detection for open/unmarked lots where per-slot sensors are not practical."}</p>
                </div>
                <div className={styles.stageItem}>
                  <div className={styles.stageHeader}><span className={`${styles.stageBadge} ${styles.stageRoadmap}`}>{lang === "hi" ? "वैकल्पिक" : "Optional"}</span><strong>{lang === "hi" ? "चरण 4: SMS एक्सेसिबिलिटी लेयर" : "Stage 4 — SMS Accessibility Layer"}</strong></div>
                  <p>{lang === "hi" ? "GSM मॉड्यूल स्मार्टफोन के बिना नागरिकों को उपलब्धता अलर्ट भेजता है। लागत: ~₹300/साइट।" : "Optional GSM module sends availability alerts to citizens without a smartphone. Cost: ~₹300/site."}</p>
                </div>
              </div>
              <div className={styles.citationBox}>
                <strong> {lang === "hi" ? "शोध संदर्भ:" : "Research Citation:"}</strong>
                <p>Elsonbaty &amp; Shams, <em>&quot;The Smart Parking Management System,&quot;</em> International Journal of Computer Science &amp; Information Technology (IJCSIT), Vol. 12, No. 4, 2020. — IoT/Arduino-based reference architecture using the same sensor → cloud → app pipeline validated in this staged approach.</p>
              </div>
              <div className={styles.scopeNote}>
                <strong> {lang === "hi" ? "MVP के दायरे से बाहर:" : "Deliberately out of MVP scope:"}</strong>{" "}
                {lang === "hi" ? "बुकिंग और डिजिटल भुगतान (UPI/QR/Card) — पहले उपलब्धता सटीकता साबित करें, फिर मुद्रीकरण।" : "Booking and digital payment (UPI/QR/Card) — \"prove availability accuracy before monetizing it.\""}
              </div>
            </div>
          </div>
        </section>

        {/*  */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={`${styles.moduleBadge} ${styles.mod2Badge}`}></span>
            <h2> {lang === "hi" ? "AI अवैध पार्किंग डिटेक्शन — विस्तृत विवरण" : "AI Illegal Parking Detection — Detail"}</h2>
            <p>{lang === "hi" ? "प्रवर्तन/डिटेक्शन पाइपलाइन — मुख्यतः एडमिन/पुलिस पक्ष पर। नागरिक-रिपोर्ट किए गए उल्लंघन इसमें फीड होते हैं।" : "Enforcement/detection pipeline — primarily surfaced on the admin/police side. Citizen-reported violations feed into it."}</p>
            <div className={styles.simWarning}>
               <strong>{lang === "hi" ? "स्पष्ट सूचना:" : "Explicit notice:"}</strong>{" "}
              {lang === "hi" ? "इस हैकाथॉन सबमिशन के लिए कैमरा, ANPR हार्डवेयर और लाइसेंस तैनात नहीं हैं। यह मॉड्यूल लेबल किए गए सॉफ्टवेयर सिमुलेशन के रूप में शिप होता है।" : "Cameras, ANPR hardware, and licensing are NOT deployed for this hackathon submission. This module ships as a labelled software simulation of the pipeline described below."}
            </div>
          </div>
          <div className={styles.pipelineGrid}>
            {[
              { step: "1", icon: "", titleEn: "Priority Scoring", titleHi: "प्राथमिकता स्कोरिंग", descEn: "Pilot only 10–20 high-risk roads scored by weighted formula: Illegal Parking Complaints 40%, Traffic Congestion 30%, Road Importance 20%, Accident Risk 10%. Score >80 → Priority A, 60–80 → Priority B, <60 → Priority C.", descHi: "पायलट में 10-20 हाई-रिस्क सड़कें: अवैध पार्किंग शिकायतें 40%, ट्रैफिक कंजेशन 30%, सड़क महत्व 20%, दुर्घटना जोखिम 10%. Score >80 → Priority A, 60–80 → Priority B, <60 → Priority C." },
              { step: "2", icon: "", titleEn: "Camera + Zone Mapping", titleHi: "कैमरा + ज़ोन मैपिंग", descEn: "Camera detects vehicle, type, and lane position on digitally-mapped no-parking zone. Zone metadata: zone id, road id, polygon coordinates, restriction type, time window, allowed vehicle type.", descHi: "कैमरा डिजिटल नो-पार्किंग ज़ोन पर वाहन, प्रकार और लेन स्थिति का पता लगाता है। ज़ोन मेटाडेटा: ज़ोन ID, सड़क ID, पॉलीगॉन निर्देशांक, प्रतिबंध प्रकार, समय विंडो।" },
              { step: "3", icon: "⏱", titleEn: "Stationary Vehicle Classification", titleHi: "स्थिर वाहन वर्गीकरण", descEn: "Tracked over time (5s → 60s+) to distinguish genuine park from a temporary traffic-light stop, avoiding false positives.", descHi: "समय के साथ ट्रैक (5s → 60s+) — ट्रैफिक-लाइट स्टॉप से वास्तविक पार्किंग को अलग करता है, झूठी पॉज़िटिव से बचाता है।" },
              { step: "4", icon: "", titleEn: "ANPR: Number Plate Read", titleHi: "ANPR: नंबर प्लेट पढ़ना", descEn: "Registration number read with confidence score, timestamp, camera ID, and image — once classified as parked.", descHi: "पंजीकरण नंबर विश्वास स्कोर, टाइमस्टैम्प, कैमरा ID, और छवि के साथ पढ़ा जाता है।" },
              { step: "5", icon: "", titleEn: "Cross-Check vs ", titleHi: "अधिकृत डेटाबेस के विरुद्ध क्रॉस-चेक", descEn: "Verify against the authorized-parking database to confirm the violation.", descHi: "अधिकृत पार्किंग डेटाबेस के विरुद्ध सत्यापित करें — उल्लंघन की पुष्टि करें।" },
              { step: "6", icon: "", titleEn: "Staged Enforcement (never fully automated)", titleHi: "चरणबद्ध प्रवर्तन (कभी स्वचालित टिकट नहीं)", descEn: "Level 1 — Warning: automated notification to move vehicle. Level 2 — Officer Alert: dashboard with camera feed, vehicle, duration, location → officer chooses: View / Issue Challan / Request Tow. Level 3 — Enforcement: challan issued; repeat offenders escalate to tow.", descHi: "Level 1 — चेतावनी: वाहन हटाने की स्वचालित सूचना। Level 2 — ऑफिसर अलर्ट: कैमरा फीड, वाहन, अवधि, स्थान → ऑफिसर चुनता है: देखें / चालान / टो। Level 3 — प्रवर्तन: चालान जारी; बार-बार अपराधी टो के लिए बढ़ते हैं।" },
              { step: "7", icon: "", titleEn: "AI Traffic Intelligence Dashboard", titleHi: "AI ट्रैफिक इंटेलिजेंस डैशबोर्ड", descEn: "Daily counts (detected / active / warnings / challans / towed) and a ranked 'Top Problem Areas' list.", descHi: "दैनिक गिनती (पता लगाया / सक्रिय / चेतावनी / चालान / टो) और रैंक किए गए 'शीर्ष समस्या क्षेत्र' सूची।" },
              { step: "8", icon: "", titleEn: "Heatmap Analysis", titleHi: "हीटमैप विश्लेषण", descEn: "Violations broken down by location, day, time-of-day, and repeat offenders.", descHi: "स्थान, दिन, दिन के समय और बार-बार अपराधियों द्वारा उल्लंघन का विश्लेषण।" },
            ].map((item, i) => (
              <div key={i} className={styles.pipelineStep}>
                <div className={styles.pipelineStepNum}>{item.step}</div>
                <div className={styles.pipelineStepContent}>
                  <div className={styles.pipelineStepTitle}><span>{item.icon}</span> {lang === "hi" ? item.titleHi : item.titleEn}</div>
                  <p>{lang === "hi" ? item.descHi : item.descEn}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TECH STACK */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2> {lang === "hi" ? "तकनीकी स्टैक" : "Technology Stack"}</h2>
            <p>{lang === "hi" ? "इस प्रोजेक्ट में उपयोग की जाने वाली तकनीकें और उनके चुनाव के कारण" : "Technologies used in this project and the rationale for each choice"}</p>
          </div>
          <div className={styles.stackGrid}>
            {[
              { icon: "▲", name: "Next.js (React)", descEn: "Single codebase for frontend and backend. Route Handlers for API endpoints, Server Components, and client interactivity all in one framework.", descHi: "फ्रंटएंड और बैकएंड के लिए एकल कोडबेस। Route Handlers API एंडपॉइंट, Server Components, और क्लाइंट इंटरएक्टिविटी सभी एक ही फ्रेमवर्क में।" },
              { icon: "", name: "Leaflet.js + OpenStreetMap", descEn: "For GIS mapping. Explicitly chosen over Google Maps to avoid metered API billing risk. Fully open-source, no API key charges.", descHi: "GIS मैपिंग के लिए। Google Maps के बजाय जानबूझकर चुना — मीटर्ड API बिलिंग जोखिम से बचने के लिए। पूरी तरह से ओपन-सोर्स।" },
              { icon: "▴", name: "Vercel (Free Tier)", descEn: "Hosting. Vercel free tier is ideal for Next.js apps — global CDN and auto-scale with zero DevOps overhead.", descHi: "होस्टिंग। Vercel मुफ्त टियर Next.js ऐप्स के लिए आदर्श है — शून्य DevOps ओवरहेड के साथ वैश्विक CDN और ऑटो-स्केल।" },
              { icon: "", nameEn: "Custom Design System", nameHi: "कस्टम डिज़ाइन सिस्टम", descEn: "Aligned with Raipur Police's own branding conventions (colors, header/footer patterns, typography). No external UI framework.", descHi: "रायपुर पुलिस की अपनी ब्रांडिंग परंपराओं (रंग, हेडर/फुटर पैटर्न, टाइपोग्राफी) के अनुरूप। कोई बाहरी UI फ्रेमवर्क नहीं।" },
            ].map((s, i) => (
              <div key={i} className={styles.stackCard}>
                <div className={styles.stackIcon}>{s.icon}</div>
                <div>
                  <strong className={styles.stackName}>{lang === "hi" && s.nameHi ? s.nameHi : s.name || s.nameEn}</strong>
                  <p className={styles.stackDesc}>{lang === "hi" ? s.descHi : s.descEn}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PHASED ROADMAP */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2> {lang === "hi" ? "चरणबद्ध रोडमैप" : "Phased Roadmap"}</h2>
            <p>{lang === "hi" ? "इस सबमिशन में माह 1 और माह 2 का अधिकांश भाग शामिल है।" : "This submission includes Month 1 and most of Month 2."}</p>
          </div>
          <div className={styles.roadmapList}>
            {[
              { monthEn: "Month 1", monthHi: "माह 1", status: "live", labelEn: " In this submission", labelHi: " इस सबमिशन में", titleEn: "Citizen App + Admin Dashboard", titleHi: "नागरिक ऐप + एडमिन डैशबोर्ड", itemsEn: ["Reporting (category, GPS, photo)", "Violation complaint CRUD", "Complaint map (GIS)", "Police officer dashboard"], itemsHi: ["रिपोर्टिंग (श्रेणी, GPS, फोटो)", "उल्लंघन शिकायत CRUD", "शिकायत मानचित्र (GIS)", "पुलिस ऑफिसर डैशबोर्ड"] },
              { monthEn: "Month 2", monthHi: "माह 2", status: "live", labelEn: " In this submission", labelHi: " इस सबमिशन में", titleEn: "Smart Parking", titleHi: "स्मार्ट पार्किंग", itemsEn: ["Parking database and capacity", "Find-parking + navigation", "Basic parking dashboard", "Manual occupancy update (Police Control)"], itemsHi: ["पार्किंग डेटाबेस व क्षमता", "पार्किंग खोज + नेवीगेशन", "बेसिक पार्किंग डैशबोर्ड", "मैन्युअल ऑक्युपेंसी अपडेट (पुलिस कंट्रोल)"] },
              { monthEn: "Month 3", monthHi: "माह 3", status: "roadmap", labelEn: " Roadmap", labelHi: " रोडमैप", titleEn: "AI Pilot", titleHi: "AI पायलट", itemsEn: ["Pilot cameras", "Digital no-parking zones", "Vehicle detection", "ANPR", "Officer alerts + warnings"], itemsHi: ["पायलट कैमरे", "डिजिटल नो-पार्किंग ज़ोन", "वाहन डिटेक्शन", "ANPR", "ऑफिसर अलर्ट + चेतावनी"] },
              { monthEn: "Month 4+", monthHi: "माह 4+", status: "roadmap", labelEn: " Roadmap", labelHi: " रोडमैप", titleEn: "Scale + Automate", titleHi: "स्केल + स्वचालन", itemsEn: ["IoT sensors", "Online payment + reservations", "Full challan integration", "Traffic analytics"], itemsHi: ["IoT सेंसर", "ऑनलाइन भुगतान + आरक्षण", "पूर्ण चालान एकीकरण", "ट्रैफिक एनालिटिक्स"] },
            ].map((r, i) => (
              <div key={i} className={`${styles.roadmapItem} ${r.status === "live" ? styles.roadmapLive : styles.roadmapRoadmap}`}>
                <div className={styles.roadmapMonthCol}>
                  <div className={styles.roadmapMonth}>{lang === "hi" ? r.monthHi : r.monthEn}</div>
                  <span className={`${styles.roadmapBadge} ${r.status === "live" ? styles.roadmapBadgeLive : styles.roadmapBadgeRoadmap}`}>{lang === "hi" ? r.labelHi : r.labelEn}</span>
                </div>
                <div className={styles.roadmapContent}>
                  <strong className={styles.roadmapTitle}>{lang === "hi" ? r.titleHi : r.titleEn}</strong>
                  <ul className={styles.roadmapItems}>
                    {(lang === "hi" ? r.itemsHi : r.itemsEn).map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DISCLAIMER */}
        <div className={styles.disclaimerBox}>
          <strong> {lang === "hi" ? "हैकाथॉन सबमिशन नोट:" : "Hackathon Submission Note:"}</strong>{" "}
          {lang === "hi" ? "यह प्रोजेक्ट रायपुर पुलिस ट्रैफिक हैकाथॉन 2026 के लिए एक प्रोटोटाइप सबमिशन है। लाइव फीड्स (ट्रैफिक, पार्किंग ऑक्युपेंसी, आपातकाल डिस्पैच) एक यथार्थवादी सिमुलेशन इंजन पर चलती हैं। कैमरे, ANPR हार्डवेयर, IoT सेंसर और वास्तविक पुलिस प्रणाली एकीकरण उत्पादन रोडमैप का हिस्सा हैं — अभी तैनात नहीं हैं।" : "This project is a prototype submission for the Raipur Police Traffic Hackathon 2026. Live feeds (traffic, parking occupancy, emergency dispatch) run on a realistic simulation engine. Cameras, ANPR hardware, IoT sensors, and actual police-system integrations are part of the production roadmap — not yet deployed."}
        </div>

      </main>
    </div>
  );
}
