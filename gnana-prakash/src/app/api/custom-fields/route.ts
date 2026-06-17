import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import CustomField from "@/models/CustomField";

import { AuditLogger } from "@/lib/audit/AuditLogger";

export async function GET(req: NextRequest) {
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const module = searchParams.get("module");
    const query: Record<string, unknown> = { isActive: true };
    if (module) query.module = module;
    const data = await CustomField.find(query).sort({ createdAt: 1 }).lean();
    return NextResponse.json(data);
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session || !["SUPER_ADMIN", "STATE_ADMIN"].includes((session.user as any).role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await connectDB();
    const body = await req.json();
    const field = await CustomField.create({ ...body, createdBy: (session.user as any).id });

    await AuditLogger.log({
      userId: session.user.sub || (session.user as any).id,
      userName: session.user.name || session.user.email || "",
      role: (session.user as any).role,
      action: "SETTINGS_CHANGED",
      module: "System Admin",
      description: `Created custom field ${field.fieldName} for module ${field.module}`,
      entityId: field._id.toString(),
      entityType: "CustomField",
      newValues: field.toObject(),
      req
    });

    return NextResponse.json(field, { status: 201 });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
