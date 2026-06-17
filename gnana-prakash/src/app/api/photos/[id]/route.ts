import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import Photo from "@/models/Photo";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    await connectDB();
    const photo = await Photo.findById(id);
    if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const role = (session.user as any).role;
    const userId = (session.user as any).id || (session.user as any)._id;

    // Check if the user is owner or an admin
    const isAdmin = ["SUPER_ADMIN", "STATE_ADMIN", "DISTRICT_ADMIN", "MANDAL_ADMIN"].includes(role);
    const isOwner = String(photo.uploadedBy) === String(userId);

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Photo.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE photo error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
