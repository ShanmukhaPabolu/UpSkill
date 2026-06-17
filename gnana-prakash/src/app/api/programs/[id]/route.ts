import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import Program from "@/models/Program";
import District from "@/models/District";
import Mandal from "@/models/Mandal";
import Venue from "@/models/Venue";
import User from "@/models/User";
import { AuditLogger } from "@/lib/audit/AuditLogger";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const program = await Program.findById(id).populate("district mandal venue createdBy").lean();
    if (!program) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(program);
  } catch (error) {
    console.error("Error in GET /api/programs/[id]:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    await connectDB();

    const oldProgram = await Program.findById(id).lean();
    if (!oldProgram) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const program = await Program.findByIdAndUpdate(id, body, { new: true });
    if (!program) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Detect if status changed
    let action = "PROGRAM_UPDATED";
    let desc = `Updated program ${program.programName}`;

    const oldStatus = ((oldProgram as any).status || "").toUpperCase();
    const newStatus = (program.status || "").toUpperCase();

    if (oldStatus !== newStatus) {
      if (newStatus === "PUBLISHED") {
        action = "PROGRAM_PUBLISHED";
        desc = `Published program ${program.programName}`;
      } else if (newStatus === "CANCELLED") {
        action = "PROGRAM_CANCELLED";
        desc = `Cancelled program ${program.programName}`;
      }
    }

    await AuditLogger.log({
      userId: session.user.sub || (session.user as any).id,
      userName: session.user.name || session.user.email || "",
      role: (session.user as any).role,
      action,
      module: "Programs",
      description: desc,
      entityId: id,
      entityType: "Program",
      oldValues: oldProgram,
      newValues: program.toObject(),
      req
    });

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error in PUT /api/programs/[id]:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as any).role;
    if (!["SUPER_ADMIN", "STATE_ADMIN", "DISTRICT_ADMIN"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await connectDB();

    const oldProgram = await Program.findById(id).lean();
    if (!oldProgram) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await Program.findByIdAndDelete(id);

    await AuditLogger.log({
      userId: session.user.sub || (session.user as any).id,
      userName: session.user.name || session.user.email || "",
      role: (session.user as any).role,
      action: "PROGRAM_DELETED",
      module: "Programs",
      description: `Deleted program ${(oldProgram as any).programName}`,
      entityId: id,
      entityType: "Program",
      oldValues: oldProgram,
      newValues: {},
      req
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/programs/[id]:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
