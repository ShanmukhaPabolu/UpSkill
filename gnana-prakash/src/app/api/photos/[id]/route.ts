import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import Photo from "@/models/Photo";
import Program from "@/models/Program";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    // Strict Role Permission: Only the Super Admin is permitted to edit metadata
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden. Only Super Admin can edit image metadata." }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { title, description, category, platform, eventDate, additionalNotes, programId } = body;

    const updateFields: Record<string, any> = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (category !== undefined) updateFields.category = category;
    if (platform !== undefined) updateFields.platform = platform;
    if (eventDate !== undefined) updateFields.eventDate = eventDate ? new Date(eventDate) : null;
    if (additionalNotes !== undefined) updateFields.additionalNotes = additionalNotes;
    
    if (programId !== undefined) {
      updateFields.program = programId || null;
      if (programId) {
        const progDoc = await Program.findById(programId).select("programName").lean();
        if (progDoc) {
          updateFields.programName = (progDoc as any).programName;
        }
      }
    }

    const photo = await Photo.findByIdAndUpdate(id, updateFields, { new: true });
    if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: photo });
  } catch (err: any) {
    console.error("PATCH photo error:", err);
    return NextResponse.json({ error: "Server error: " + err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const role = (session.user as any).role;
    // Strict Role Permission: Only Super Admin is permitted to delete images
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden. Only Super Admin can delete images." }, { status: 403 });
    }

    await connectDB();
    const photo = await Photo.findById(id);
    if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await Photo.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE photo error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
