import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/mongoose";
import AuditLog from "@/models/AuditLog";

export async function GET(req: NextRequest) {
  try {
    let token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: process.env.NODE_ENV === 'production' || req.url.startsWith('https://') });
    if (!token) token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: false });
    const session = token ? { user: token } : null;
    if (!session || (session.user as any).role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      AuditLog.find({}).populate("user", "name email role").sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(),
    ]);
    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
