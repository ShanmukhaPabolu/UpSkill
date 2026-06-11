import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/mongoose";
import Participant from "@/models/Participant";

export async function GET(req: NextRequest) {
  try {
    let token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: process.env.NODE_ENV === 'production' || req.url.startsWith('https://') });
    if (!token) token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: false });
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const program = searchParams.get("program");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};
    if (program) query.program = program;
    if (category) query.category = category;
    if (search) query.$or = [
      { name: { $regex: search, $options: "i" } },
      { employeeId: { $regex: search, $options: "i" } },
    ];

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Participant.find(query).populate("program", "programName").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Participant.countDocuments(query),
    ]);
    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: process.env.NODE_ENV === 'production' || req.url.startsWith('https://') });
    if (!token) token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: false });
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const body = await req.json();
    const participant = await Participant.create(body);
    return NextResponse.json(participant, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
