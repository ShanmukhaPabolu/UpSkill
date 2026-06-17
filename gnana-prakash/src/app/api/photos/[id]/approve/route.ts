import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import Photo from "@/models/Photo";
import AuditLog from "@/models/AuditLog";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    // Strict Role Permission: Only the Super Admin is permitted to approve/reject requests
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden. Only Super Admin can perform review actions." }, { status: 403 });
    }

    await connectDB();
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

    await AuditLog.create({ 
      user: (session.user as any).id, 
      role, 
      action: `MEDIA_${status.toUpperCase()}`, 
      module: "PHOTO", 
      resourceId: id 
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
