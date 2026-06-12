import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import District from "@/models/District";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session || (session.user as any).role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await connectDB();
    const body = await req.json();
    const district = await District.findByIdAndUpdate(id, body, { new: true });
    if (!district) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(district);
  } catch (error) { 
    return NextResponse.json({ error: "Server error" }, { status: 500 }); 
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session || (session.user as any).role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await connectDB();
    const district = await District.findByIdAndDelete(id);
    if (!district) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) { 
    return NextResponse.json({ error: "Server error" }, { status: 500 }); 
  }
}
