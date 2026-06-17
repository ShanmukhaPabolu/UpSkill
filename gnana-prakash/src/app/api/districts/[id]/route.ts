import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import District from "@/models/District";
import { AuditLogger } from "@/lib/audit/AuditLogger";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session || !["SUPER_ADMIN", "STATE_ADMIN"].includes((session.user as any).role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await connectDB();
    const body = await req.json();

    const oldDistrict = await District.findById(id).lean();
    if (!oldDistrict) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const district = await District.findByIdAndUpdate(id, body, { new: true });
    if (!district) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await AuditLogger.log({
      userId: session.user.sub || (session.user as any).id,
      userName: session.user.name || session.user.email || "",
      role: (session.user as any).role,
      action: "DISTRICT_UPDATED",
      module: "Districts",
      description: `Updated district ${district.name}`,
      entityId: id,
      entityType: "District",
      oldValues: oldDistrict,
      newValues: district.toObject(),
      req
    });

    return NextResponse.json(district);
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

    const oldDistrict = await District.findById(id).lean();
    if (!oldDistrict) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await District.findByIdAndDelete(id);

    await AuditLogger.log({
      userId: session.user.sub || (session.user as any).id,
      userName: session.user.name || session.user.email || "",
      role: (session.user as any).role,
      action: "DISTRICT_DELETED",
      module: "Districts",
      description: `Deleted district ${(oldDistrict as any).name}`,
      entityId: id,
      entityType: "District",
      oldValues: oldDistrict,
      newValues: {},
      req
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) { 
    return NextResponse.json({ error: "Server error" }, { status: 500 }); 
  }
}
