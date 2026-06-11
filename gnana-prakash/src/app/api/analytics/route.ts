import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/mongoose";
import Program from "@/models/Program";
import Participant from "@/models/Participant";
import Attendance from "@/models/Attendance";
import Venue from "@/models/Venue";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "overview";

    if (type === "district-participation") {
      const data = await Participant.aggregate([
        { $group: { _id: "$district", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);
      return NextResponse.json(data);
    }

    if (type === "attendance-trend") {
      const data = await Attendance.aggregate([
        { $group: { _id: { $month: "$date" }, total: { $sum: "$totalAttendance" }, days: { $sum: 1 } } },
        { $sort: { "_id": 1 } },
      ]);
      return NextResponse.json(data);
    }

    if (type === "category-distribution") {
      const data = await Participant.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
      return NextResponse.json(data);
    }

    return NextResponse.json({ message: "Analytics endpoint ready" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
