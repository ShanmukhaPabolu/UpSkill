import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import Mandal from "@/models/Mandal";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session || !["SUPER_ADMIN", "DISTRICT_ADMIN"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await connectDB();
    const body = await req.json();
    const mandal = await Mandal.findByIdAndUpdate(id, body, { new: true });
    if (!mandal) return NextResponse.json({ error: "Not found" }, { status: 404 });
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
    if (!session || !["SUPER_ADMIN", "DISTRICT_ADMIN"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await connectDB();
    const mandal = await Mandal.findByIdAndDelete(id);
    if (!mandal) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) { 
    return NextResponse.json({ error: "Server error" }, { status: 500 }); 
  }
}
