import mongoose, { Schema } from "mongoose";

const AuditLogSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  role: { type: String, required: true },
  action: { type: String, required: true },
  module: { type: String, required: true },
  resourceId: { type: String },
  resourceType: { type: String },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
}, { timestamps: false });

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ user: 1, timestamp: -1 });

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
