import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/mongoose";
import Program from "@/models/Program";
import Participant from "@/models/Participant";
import Attendance from "@/models/Attendance";

export async function GET(req: NextRequest) {
  let token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: process.env.NODE_ENV === 'production' || req.url.startsWith('https://') });
    if (!token) token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: false });
    const session = token ? { user: token } : null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "attendance";
  const format = searchParams.get("format") || "excel";
  
  let reportData: Record<string, unknown>[] = [];
  if (type === "attendance") {
    reportData = await Attendance.find({}).populate("program", "programName").lean() as unknown as Record<string, unknown>[];
  } else if (type === "participant") {
    reportData = await Participant.find({}).populate("program", "programName").lean() as unknown as Record<string, unknown>[];
  } else if (type === "consolidated") {
    reportData = await Program.find({}).populate("district mandal venue").lean() as unknown as Record<string, unknown>[];
  }

  // For prototype: return JSON (in production, generate actual PDF/Excel)
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Content-Disposition", `attachment; filename="${type}-report.json"`);
  return new NextResponse(JSON.stringify(reportData, null, 2), { headers });
}
