import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import connectDB from "@/lib/db/mongoose";
import Program from "@/models/Program";
import AuditLog from "@/models/AuditLog";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const program = await Program.findById(params.id).populate("district mandal venue createdBy").lean();
    if (!program) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(program);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    await connectDB();
    const program = await Program.findByIdAndUpdate(params.id, body, { new: true });
    if (!program) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await AuditLog.create({ user: (session.user as any).id, role: (session.user as any).role, action: "UPDATE", module: "PROGRAM", resourceId: params.id });
    return NextResponse.json(program);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as any).role;
    if (!["SUPER_ADMIN","DISTRICT_ADMIN"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await connectDB();
    await Program.findByIdAndDelete(params.id);
    await AuditLog.create({ user: (session.user as any).id, role, action: "DELETE", module: "PROGRAM", resourceId: params.id });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
