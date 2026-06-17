import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import Video from "@/models/Video";
import { AuditLogger } from "@/lib/audit/AuditLogger";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!["SUPER_ADMIN", "STATE_ADMIN", "DISTRICT_ADMIN"].includes((session.user as any).role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await connectDB();

    const oldVideo = await Video.findById(id).lean();
    if (!oldVideo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { action, remarks } = await req.json();
    const status = action === "approve" ? "APPROVED" : "REJECTED";
    const video = await Video.findByIdAndUpdate(id, { status, approvedBy: (session.user as any).id, approvalDate: new Date(), remarks }, { new: true });
    if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const auditAction = action === "approve" ? "MEDIA_APPROVE" : "MEDIA_REJECT";
    const auditDesc = action === "approve" 
      ? `Approved video request for ${video.title}` 
      : `Rejected video request for ${video.title} with remarks: ${remarks || "None"}`;

    await AuditLogger.log({
      userId: session.user.sub || (session.user as any).id,
      userName: session.user.name || session.user.email || "",
      role: (session.user as any).role,
      action: auditAction,
      module: "Videos",
      description: auditDesc,
      entityId: id,
      entityType: "Video",
      oldValues: oldVideo,
      newValues: video.toObject(),
      req
    });

    return NextResponse.json(video);
  } catch (error) { 
    return NextResponse.json({ error: "Server error" }, { status: 500 }); 
  }
}
