import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/mongoose";
import Attendance from "@/models/Attendance";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const program = searchParams.get("program");
    if (!program) return NextResponse.json({ error: "program required" }, { status: 400 });
    const data = await Attendance.find({ program }).sort({ dayNumber: 1 }).populate("recordedBy", "name").lean();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const body = await req.json();
    const total = (body.sgt||0)+(body.krp||0)+(body.drp||0)+(body.deoStaff||0)+(body.ssStaff||0)+(body.meo||0)+(body.hm||0)+(body.crp||0)+(body.others||0);
    const record = await Attendance.findOneAndUpdate(
      { program: body.program, date: new Date(body.date) },
      { ...body, totalAttendance: total, recordedBy: (session.user as any).id },
      { upsert: true, new: true }
    );
    return NextResponse.json(record, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
