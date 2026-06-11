import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import FoodRecord from "@/models/FoodRecord";

export async function GET(req: NextRequest) {
  const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(req.url);
  const program = searchParams.get("program");
  const query: Record<string, unknown> = {};
  if (program) query.program = program;
  const data = await FoodRecord.find(query).sort({ date: -1 }).lean();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const record = await FoodRecord.findOneAndUpdate(
    { program: body.program, date: new Date(body.date) },
    { ...body, recordedBy: (session.user as any).id },
    { upsert: true, new: true }
  );
  return NextResponse.json(record, { status: 201 });
}
