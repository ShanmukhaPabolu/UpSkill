import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import Photo from "@/models/Photo";
import { AuditLogger } from "@/lib/audit/AuditLogger";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden. Only Super Admin can perform review actions." }, { status: 403 });
    }

    await connectDB();
    const oldPhoto = await Photo.findById(id).lean();
    if (!oldPhoto) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { action, remarks } = await req.json();
    const status = action === "approve" ? "Approved" : "Rejected";

    const updateFields: Record<string, any> = {
      status,
      approvedBy: (session.user as any).id,
      approvalDate: new Date(),
      remarks: remarks || "",
      rejectionReason: remarks || ""
    };

    const photo = await Photo.findByIdAndUpdate(id, updateFields, { new: true });
    if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const oldClean = { ...(oldPhoto as any) };
    if (oldClean.image) delete oldClean.image;
    if (oldClean.url) delete oldClean.url;

    const newClean = photo.toObject();
    if (newClean.image) delete newClean.image;
    if (newClean.url) delete newClean.url;

    const auditAction = action === "approve" ? "MEDIA_APPROVE" : "MEDIA_REJECT";
    const auditDesc = action === "approve" 
      ? `Approved photo request for ${photo.title}` 
      : `Rejected photo request for ${photo.title} with remarks: ${remarks || "None"}`;

    await AuditLogger.log({
      userId: session.user.sub || (session.user as any).id,
      userName: session.user.name || session.user.email || "",
      role: (session.user as any).role,
      action: auditAction,
      module: "Photos",
      description: auditDesc,
      entityId: id,
      entityType: "Photo",
      oldValues: oldClean,
      newValues: newClean,
      req
    });

    const successMessage = action === "approve" 
      ? "Image request approved successfully." 
      : "Image request rejected successfully.";

    return NextResponse.json({ 
      success: true, 
      message: successMessage, 
      data: photo 
    });
  } catch (err: any) {
    console.error("POST approve error:", err);
    return NextResponse.json({ error: "Server error: " + err.message }, { status: 500 });
  }
}
