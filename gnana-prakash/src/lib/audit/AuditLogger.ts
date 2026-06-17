import connectDB from "@/lib/db/mongoose";
import AuditLog from "@/models/AuditLog";

export class AuditLogger {
  static async log({
    userId,
    userName,
    role,
    action,
    module,
    description,
    entityId,
    entityType,
    oldValues = {},
    newValues = {},
    req
  }: {
    userId?: string;
    userName?: string;
    role?: string;
    action: string;
    module: string;
    description: string;
    entityId?: string;
    entityType?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    req?: Request;
  }) {
    try {
      await connectDB();
      
      let ipAddress = "127.0.0.1";
      let deviceInfo = "Unknown Device";
      
      if (req) {
        ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
        deviceInfo = req.headers.get("user-agent") || "Unknown Device";
      }

      const logEntry = new AuditLog({
        userId: userId || "SYSTEM",
        userName: userName || "System Process",
        role: role || "SYSTEM",
        action,
        module,
        description,
        entityId,
        entityType,
        ipAddress,
        deviceInfo,
        oldValues,
        newValues,
        createdAt: new Date()
      });

      await logEntry.save();
    } catch (error) {
      console.error("AuditLogger error:", error);
    }
  }
}
