import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import Mandal from "@/models/Mandal";
import { AuditLogger } from "@/lib/audit/AuditLogger";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session || !["SUPER_ADMIN", "STATE_ADMIN", "DISTRICT_ADMIN"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await connectDB();
    const body = await req.json();

    const oldMandal = await Mandal.findById(id).lean();
    if (!oldMandal) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const mandal = await Mandal.findByIdAndUpdate(id, body, { new: true });
    if (!mandal) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await AuditLogger.log({
      userId: session.user.sub || (session.user as any).id,
      userName: session.user.name || session.user.email || "",
      role: (session.user as any).role,
      action: "MANDAL_UPDATED",
      module: "Mandals",
      description: `Updated mandal ${mandal.name}`,
      entityId: id,
      entityType: "Mandal",
      oldValues: oldMandal,
      newValues: mandal.toObject(),
      req
    });

    return NextResponse.json(mandal);
  } catch (error) { 
    return NextResponse.json({ error: "Server error" }, { status: 500 }); 
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session || !["SUPER_ADMIN", "STATE_ADMIN", "DISTRICT_ADMIN"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await connectDB();

    const oldMandal = await Mandal.findById(id).lean();
    if (!oldMandal) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await Mandal.findByIdAndDelete(id);

    await AuditLogger.log({
      userId: session.user.sub || (session.user as any).id,
      userName: session.user.name || session.user.email || "",
      role: (session.user as any).role,
      action: "MANDAL_DELETED",
      module: "Mandals",
      description: `Deleted mandal ${(oldMandal as any).name}`,
      entityId: id,
      entityType: "Mandal",
      oldValues: oldMandal,
      newValues: {},
      req
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) { 
    return NextResponse.json({ error: "Server error" }, { status: 500 }); 
  }
}
