import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import Program from "@/models/Program";
import District from "@/models/District";
import Mandal from "@/models/Mandal";
import Venue from "@/models/Venue";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";

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
    const program = await Program.findByIdAndUpdate(id, body, { new: true });
    if (!program) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await AuditLog.create({ user: (session.user as any).id, role: (session.user as any).role, action: "UPDATE", module: "PROGRAM", resourceId: id });
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
    await Program.findByIdAndDelete(id);
    await AuditLog.create({ user: (session.user as any).id, role, action: "DELETE", module: "PROGRAM", resourceId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/programs/[id]:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
