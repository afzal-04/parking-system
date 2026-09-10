import { NextResponse } from "next/server";
import { getPatrolUnits, addPatrolUnit, deletePatrolUnit } from "@/lib/db";

export async function GET() {
  try {
    const patrolUnits = getPatrolUnits();
    return NextResponse.json({ success: true, patrolUnits });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.lat || !body.lng) {
      return NextResponse.json(
        { success: false, error: "Name, latitude, and longitude are required." },
        { status: 400 }
      );
    }

    const unit = addPatrolUnit({
      ...body,
      lat: Number(body.lat),
      lng: Number(body.lng),
    });

    return NextResponse.json({ success: true, unit }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }
    deletePatrolUnit(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
