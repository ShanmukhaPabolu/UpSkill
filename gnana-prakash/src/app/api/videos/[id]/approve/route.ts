import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/mongoose";
import Video from "@/models/Video";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    let token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: process.env.NODE_ENV === 'production' || req.url.startsWith('https://') });
    if (!token) token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: false });
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!["SUPER_ADMIN","DISTRICT_ADMIN"].includes((session.user as any).role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await connectDB();
    const { action, remarks } = await req.json();
    const status = action === "approve" ? "APPROVED" : "REJECTED";
    const video = await Video.findByIdAndUpdate(id, { status, approvedBy: (session.user as any).id, approvalDate: new Date(), remarks }, { new: true });
    if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(video);
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
