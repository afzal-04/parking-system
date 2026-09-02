import { NextResponse } from "next/server";
import { updateStatus } from "@/lib/db";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { status } = await request.json();
  const updated = updateStatus(id, status);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ complaint: updated });
}
