import mongoose, { Schema } from "mongoose";

const PhotoSchema = new Schema({
  program: { type: Schema.Types.ObjectId, ref: "Program", index: true },
  venue: { type: Schema.Types.ObjectId, ref: "Venue" },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  url: { type: String, required: true },
  category: {
    type: String,
    enum: ["VENUE","INAUGURATION","CLASSROOM","BREAKFAST","TEA_BREAK","LUNCH","SNACKS","DINNER","ACCOMMODATION","VALEDICTORY"],
    required: true,
  },
  status: { type: String, enum: ["PENDING","APPROVED","REJECTED"], default: "PENDING" },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  uploadDate: { type: Date, default: Date.now },
  approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  approvalDate: { type: Date },
  remarks: { type: String },
  size: { type: Number },
  tags: [{ type: String }],
}, { timestamps: true });

PhotoSchema.index({ program: 1, status: 1 });
PhotoSchema.index({ category: 1, status: 1 });

export default mongoose.models.Photo || mongoose.model("Photo", PhotoSchema);
