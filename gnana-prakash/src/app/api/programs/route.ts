import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import Program from "@/models/Program";
import AuditLog from "@/models/AuditLog";
import { programSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const district = searchParams.get("district");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (district) query.district = district;
    if (search) query.programName = { $regex: search, $options: "i" };

    const role = (session.user as any).role;
    if (role === "DISTRICT_ADMIN") query.district = (session.user as any).district;
    else if (["MANDAL_ADMIN","VENUE_ADMIN"].includes(role)) query.mandal = (session.user as any).mandal;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Program.find(query).populate("district", "name").populate("mandal", "name").populate("venue", "name").populate("createdBy", "name").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Program.countDocuments(query),
    ]);

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = programSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: parsed.error.errors }, { status: 400 });

    await connectDB();
    const start = new Date(parsed.data.startDate);
    const end = new Date(parsed.data.endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const program = await Program.create({
      ...parsed.data,
      totalDays,
      createdBy: (session.user as any).id,
    });

    await AuditLog.create({
      user: (session.user as any).id,
      role: (session.user as any).role,
      action: "CREATE",
      module: "PROGRAM",
      resourceId: program._id.toString(),
      details: { programName: program.programName },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
