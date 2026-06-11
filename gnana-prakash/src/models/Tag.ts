import mongoose, { Schema } from "mongoose";

const TagSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  color: { type: String, default: "#3b82f6" },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.models.Tag || mongoose.model("Tag", TagSchema);
