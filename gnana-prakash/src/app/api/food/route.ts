import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import FoodRecord from "@/models/FoodRecord";
import { AuditLogger } from "@/lib/audit/AuditLogger";

import Program from "@/models/Program";

export async function GET(req: NextRequest) {
  const token = await getAuthToken(req);
  const session = token ? { user: token } : null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(req.url);
  const program = searchParams.get("program");
  const query: Record<string, unknown> = {};
  if (program) query.program = program;
  const data = await FoodRecord.find(query).populate("program", "programName").sort({ date: -1 }).lean();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const body = await req.json();

    const oldRecord = await FoodRecord.findOne({ program: body.program, date: new Date(body.date) }).lean();

    const record = await FoodRecord.findOneAndUpdate(
      { program: body.program, date: new Date(body.date) },
      { ...body, recordedBy: (session.user as any).id },
      { upsert: true, new: true }
    );

    const action = oldRecord ? "FOOD_RECORD_UPDATED" : "FOOD_RECORD_ADDED";
    const description = oldRecord 
      ? `Updated food record for program ${body.programName || body.program} on ${new Date(body.date).toLocaleDateString()}`
      : `Added food record for program ${body.programName || body.program} on ${new Date(body.date).toLocaleDateString()}`;

    await AuditLogger.log({
      userId: session.user.sub || (session.user as any).id,
      userName: session.user.name || session.user.email || "",
      role: (session.user as any).role,
      action,
      module: "Food",
      description,
      entityId: record._id.toString(),
      entityType: "FoodRecord",
      oldValues: oldRecord || {},
      newValues: record.toObject(),
      req
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Food record post error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
