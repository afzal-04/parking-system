import { NextResponse } from "next/server";
import { readComplaints, addComplaint } from "@/lib/db";

export async function GET() {
  const complaints = readComplaints();
  return NextResponse.json({ complaints });
}

export async function POST(request) {
  const body = await request.json();
  const { category, categoryEn, location, lat, lng, description } = body;

  if (!category || !location || !description) {
    return NextResponse.json(
      { error: "आवश्यक जानकारी अधूरी है।" },
      { status: 400 }
    );
  }

  const entry = {
    id: "RPT-" + Math.floor(1000 + Math.random() * 9000),
    category,
    categoryEn: categoryEn || category,
    location,
    lat: lat ?? 21.2514,
    lng: lng ?? 81.6296,
    description,
    status: "pending",
    reportedAt: new Date().toISOString(),
    photo: null,
  };

  addComplaint(entry);
  return NextResponse.json({ complaint: entry }, { status: 201 });
}
