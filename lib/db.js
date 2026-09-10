import fs from "fs";
import path from "path";
import { POLICE_STATIONS, PATROL_UNITS } from "./policeStations";

const COMPLAINTS_DB_PATH = path.join(process.cwd(), "data", "complaints.json");
const POLICE_DB_PATH = path.join(process.cwd(), "data", "policeData.json");

export function readComplaints() {
  try {
    const raw = fs.readFileSync(COMPLAINTS_DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function writeComplaints(complaints) {
  fs.writeFileSync(COMPLAINTS_DB_PATH, JSON.stringify(complaints, null, 2), "utf-8");
}

export function addComplaint(entry) {
  const complaints = readComplaints();
  complaints.unshift(entry);
  writeComplaints(complaints);
  return entry;
}

export function updateStatus(id, status) {
  const complaints = readComplaints();
  const idx = complaints.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  complaints[idx].status = status;
  writeComplaints(complaints);
  return complaints[idx];
}

// ----------------------------------------------------
// Police Stations & Patrolling Units Persistent Storage
// ----------------------------------------------------
export function readPoliceData() {
  try {
    if (!fs.existsSync(POLICE_DB_PATH)) {
      const initial = { stations: POLICE_STATIONS, patrolUnits: PATROL_UNITS };
      fs.writeFileSync(POLICE_DB_PATH, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(POLICE_DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { stations: POLICE_STATIONS, patrolUnits: PATROL_UNITS };
  }
}

export function writePoliceData(data) {
  fs.writeFileSync(POLICE_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function getPoliceStations() {
  const data = readPoliceData();
  return data.stations || [];
}

export function addPoliceStation(station) {
  const data = readPoliceData();
  const newStation = {
    id: station.id || `station-${Date.now()}`,
    type: "station",
    status: "open_24x7",
    statusLabel: { hi: "24x7 खुला", en: "24x7 Active" },
    ...station,
  };
  data.stations = [newStation, ...(data.stations || [])];
  writePoliceData(data);
  return newStation;
}

export function deletePoliceStation(id) {
  const data = readPoliceData();
  data.stations = (data.stations || []).filter((s) => s.id !== id);
  writePoliceData(data);
  return true;
}

export function getPatrolUnits() {
  const data = readPoliceData();
  return data.patrolUnits || [];
}

export function addPatrolUnit(unit) {
  const data = readPoliceData();
  const newUnit = {
    id: unit.id || `patrol-${Date.now()}`,
    type: "patrol",
    status: unit.status || "on_patrol",
    statusLabel: { hi: "सक्रिय गश्त (Active)", en: "Active Patrol" },
    speed: unit.speed || "20 km/h",
    fuelBattery: unit.fuelBattery || "95%",
    waypoints: unit.waypoints || [[unit.lat, unit.lng]],
    ...unit,
  };
  data.patrolUnits = [newUnit, ...(data.patrolUnits || [])];
  writePoliceData(data);
  return newUnit;
}

export function deletePatrolUnit(id) {
  const data = readPoliceData();
  data.patrolUnits = (data.patrolUnits || []).filter((u) => u.id !== id);
  writePoliceData(data);
  return true;
}
