import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import AuditLog from "@/models/AuditLog";

export async function GET(req: NextRequest) {
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    
    // Strict Access Control: Only SUPER_ADMIN can view audit logs
    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const isExport = searchParams.get("export") === "true";

    const search = searchParams.get("search");
    const moduleFilter = searchParams.get("module");
    const actionFilter = searchParams.get("action");
    const roleFilter = searchParams.get("role");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query: Record<string, any> = {};

    if (moduleFilter && moduleFilter !== "ALL") {
      query.module = moduleFilter;
    }
    if (actionFilter && actionFilter !== "ALL") {
      query.action = actionFilter;
    }
    if (roleFilter && roleFilter !== "ALL") {
      query.role = roleFilter;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
        { module: { $regex: search, $options: "i" } },
      ];
    }

    if (isExport) {
      // Return all matched logs for export
      const data = await AuditLog.find(query).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ data });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const skip = (page - 1) * limit;
    const [data, total, totalOverall, todayCount, failedLogins, uniqueUsers] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query),
      AuditLog.countDocuments({}),
      AuditLog.countDocuments({ createdAt: { $gte: today } }),
      AuditLog.countDocuments({ action: "FAILED_LOGIN_ATTEMPT" }),
      AuditLog.distinct("userId"),
    ]);

    const stats = {
      totalOverall,
      todayCount,
      failedLogins,
      activeUsers: uniqueUsers.length
    };

    return NextResponse.json({ 
      data, 
      total, 
      page, 
      limit, 
      totalPages: Math.ceil(total / limit),
      stats
    });
  } catch (error) { 
    console.error("AuditLog GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 }); 
  }
}
