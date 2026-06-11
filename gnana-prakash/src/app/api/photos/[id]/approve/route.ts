import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import connectDB from "@/lib/db/mongoose";
import Photo from "@/models/Photo";
import AuditLog from "@/models/AuditLog";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as any).role;
    if (!["SUPER_ADMIN","DISTRICT_ADMIN"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await connectDB();
    const { action, remarks } = await req.json();
    const status = action === "approve" ? "APPROVED" : "REJECTED";
    const photo = await Photo.findByIdAndUpdate(params.id, {
      status,
      approvedBy: (session.user as any).id,
      approvalDate: new Date(),
      remarks,
    }, { new: true });
    if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await AuditLog.create({ user: (session.user as any).id, role, action: `MEDIA_${status}`, module: "PHOTO", resourceId: params.id });
    return NextResponse.json(photo);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
