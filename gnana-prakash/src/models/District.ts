import mongoose, { Schema, Document } from "mongoose";

export interface IDistrictDoc extends Document {
  name: string;
  code: string;
  state: string;
  adminId?: mongoose.Types.ObjectId;
  isActive: boolean;
}

const DistrictSchema = new Schema<IDistrictDoc>({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  state: { type: String, default: "Andhra Pradesh" },
  adminId: { type: Schema.Types.ObjectId, ref: "User" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

DistrictSchema.index({ name: 1, isActive: 1 });

export default mongoose.models.District || mongoose.model<IDistrictDoc>("District", DistrictSchema);
