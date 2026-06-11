import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import connectDB from "@/lib/db/mongoose";
import Mandal from "@/models/Mandal";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const district = searchParams.get("district");
    const query: Record<string, unknown> = { isActive: true };
    if (district) query.district = district;
    const data = await Mandal.find(query).populate("district", "name").sort({ name: 1 }).lean();
    return NextResponse.json(data);
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["SUPER_ADMIN","DISTRICT_ADMIN"].includes((session.user as any).role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await connectDB();
    const body = await req.json();
    const mandal = await Mandal.create(body);
    return NextResponse.json(mandal, { status: 201 });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
