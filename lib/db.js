import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "complaints.json");

export function readComplaints() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

export function writeComplaints(complaints) {
  fs.writeFileSync(DB_PATH, JSON.stringify(complaints, null, 2), "utf-8");
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
