import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import Program from "@/models/Program";
import Participant from "@/models/Participant";
import Attendance from "@/models/Attendance";
import Venue from "@/models/Venue";
import FoodRecord from "@/models/FoodRecord";

export async function GET(req: NextRequest) {
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "overview";

    if (type === "district-participation") {
      const data = await Participant.aggregate([
        {
          $group: {
            _id: "$district",
            teachers: {
              $sum: {
                $cond: [{ $eq: ["$category", "SGT"] }, 1, 0]
              }
            },
            trainers: {
              $sum: {
                $cond: [{ $in: ["$category", ["KRP", "DRP"]] }, 1, 0]
              }
            },
            staff: {
              $sum: {
                $cond: [{ $in: ["$category", ["DEO_STAFF", "SS_OFFICE_STAFF"]] }, 1, 0]
              }
            },
            total: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "districts",
            localField: "_id",
            foreignField: "_id",
            as: "districtInfo"
          }
        },
        { $unwind: { path: "$districtInfo", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            name: { $ifNull: ["$districtInfo.name", "Unknown"] },
            teachers: 1,
            trainers: 1,
            staff: 1,
            total: 1
          }
        },
        { $sort: { total: -1 } },
        { $limit: 10 }
      ]);
      return NextResponse.json(data);
    }

    if (type === "attendance-trend") {
      const data = await Attendance.aggregate([
        {
          $group: {
            _id: { $month: "$date" },
            sgt: { $sum: "$sgt" },
            krp: { $sum: "$krp" },
            drp: { $sum: "$drp" },
            others: { $sum: { $add: ["$deoStaff", "$ssStaff", "$meo", "$hm", "$crp", "$others"] } },
            total: { $sum: "$totalAttendance" }
          }
        },
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

    if (type === "food-trends") {
      const data = await FoodRecord.aggregate([
        {
          $group: {
            _id: { $month: "$date" },
            breakfast: { $sum: "$breakfast.participants" },
            lunch: { $sum: "$lunch.participants" },
            dinner: { $sum: "$dinner.participants" }
          }
        },
        { $sort: { "_id": 1 } }
      ]);
      return NextResponse.json(data);
    }

    if (type === "venue-utilization") {
      const data = await Program.aggregate([
        { $group: { _id: "$venue", programsCount: { $sum: 1 } } },
        {
          $lookup: {
            from: "venues",
            localField: "_id",
            foreignField: "_id",
            as: "venueInfo"
          }
        },
        { $unwind: { path: "$venueInfo", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            venue: { $ifNull: ["$venueInfo.name", "Unknown"] },
            programs: "$programsCount",
            occupancy: { $min: [{ $add: [60, { $multiply: ["$programsCount", 5] }] }, 98] }
          }
        },
        { $sort: { programs: -1 } },
        { $limit: 10 }
      ]);
      return NextResponse.json(data);
    }

    return NextResponse.json({ message: "Analytics endpoint ready" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
