import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import Venue from "@/models/Venue";
import { AuditLogger } from "@/lib/audit/AuditLogger";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getAuthToken(req);
  const session = token ? { user: token } : null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const venue = await Venue.findById(id).populate("district mandal").lean();
  if (!venue) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(venue);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session || !["SUPER_ADMIN", "STATE_ADMIN", "DISTRICT_ADMIN"].includes((session.user as any).role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await connectDB();
    const body = await req.json();

    const oldVenue = await Venue.findById(id).lean();
    if (!oldVenue) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const venue = await Venue.findByIdAndUpdate(id, body, { new: true });
    if (!venue) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await AuditLogger.log({
      userId: session.user.sub || (session.user as any).id,
      userName: session.user.name || session.user.email || "",
      role: (session.user as any).role,
      action: "VENUE_UPDATED",
      module: "Venues",
      description: `Updated venue ${venue.name}`,
      entityId: id,
      entityType: "Venue",
      oldValues: oldVenue,
      newValues: venue.toObject(),
      req
    });

    return NextResponse.json(venue);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session || !["SUPER_ADMIN", "STATE_ADMIN"].includes((session.user as any).role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await connectDB();

    const oldVenue = await Venue.findById(id).lean();
    if (!oldVenue) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await Venue.findByIdAndUpdate(id, { isActive: false });

    await AuditLogger.log({
      userId: session.user.sub || (session.user as any).id,
      userName: session.user.name || session.user.email || "",
      role: (session.user as any).role,
      action: "VENUE_DELETED",
      module: "Venues",
      description: `Deleted venue ${(oldVenue as any).name} (marked inactive)`,
      entityId: id,
      entityType: "Venue",
      oldValues: oldVenue,
      newValues: { ...(oldVenue as any), isActive: false },
      req
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
