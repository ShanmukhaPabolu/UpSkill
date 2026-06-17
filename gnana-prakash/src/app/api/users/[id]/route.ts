import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import { AuditLogger } from "@/lib/audit/AuditLogger";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session || !["SUPER_ADMIN", "STATE_ADMIN"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await connectDB();
    const body = await req.json();

    const oldUser = await User.findById(id).lean();
    if (!oldUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const user = await User.findByIdAndUpdate(id, body, { new: true }).select("-password");
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let action = "USER_UPDATED";
    let desc = `Updated user ${user.name} (${user.email})`;
    if ((oldUser as any).isActive !== user.isActive) {
      action = user.isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED";
      desc = `${user.isActive ? "Activated" : "Deactivated"} user ${user.name} (${user.email})`;
    } else if ((oldUser as any).role !== user.role) {
      action = "ROLE_CHANGED";
      desc = `Changed role of user ${user.name} (${user.email}) from ${(oldUser as any).role} to ${user.role}`;
    }

    await AuditLogger.log({
      userId: session.user.sub || (session.user as any).id,
      userName: session.user.name || session.user.email || "",
      role: (session.user as any).role,
      action,
      module: "Users",
      description: desc,
      entityId: id,
      entityType: "User",
      oldValues: oldUser,
      newValues: user.toObject(),
      req
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("PATCH user error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session || !["SUPER_ADMIN", "STATE_ADMIN"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await connectDB();
    const body = await req.json();
    delete body.password;

    const oldUser = await User.findById(id).lean();
    if (!oldUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const user = await User.findByIdAndUpdate(id, body, { new: true }).select("-password");
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let action = "USER_UPDATED";
    let desc = `Updated user ${user.name} (${user.email})`;
    if ((oldUser as any).isActive !== user.isActive) {
      action = user.isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED";
      desc = `${user.isActive ? "Activated" : "Deactivated"} user ${user.name} (${user.email})`;
    } else if ((oldUser as any).role !== user.role) {
      action = "ROLE_CHANGED";
      desc = `Changed role of user ${user.name} (${user.email}) from ${(oldUser as any).role} to ${user.role}`;
    }

    await AuditLogger.log({
      userId: session.user.sub || (session.user as any).id,
      userName: session.user.name || session.user.email || "",
      role: (session.user as any).role,
      action,
      module: "Users",
      description: desc,
      entityId: id,
      entityType: "User",
      oldValues: oldUser,
      newValues: user.toObject(),
      req
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("PUT user error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session || !["SUPER_ADMIN", "STATE_ADMIN"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await connectDB();

    const oldUser = await User.findById(id).lean();
    if (!oldUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await User.findByIdAndDelete(id);

    await AuditLogger.log({
      userId: session.user.sub || (session.user as any).id,
      userName: session.user.name || session.user.email || "",
      role: (session.user as any).role,
      action: "USER_DELETED",
      module: "Users",
      description: `Deleted user ${(oldUser as any).name} (${(oldUser as any).email})`,
      entityId: id,
      entityType: "User",
      oldValues: oldUser,
      newValues: {},
      req
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE user error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
