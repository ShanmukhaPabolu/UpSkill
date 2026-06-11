import mongoose, { Schema } from "mongoose";

const VideoSchema = new Schema({
  program: { type: Schema.Types.ObjectId, ref: "Program", index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  filename: { type: String, required: true },
  url: { type: String, required: true },
  category: {
    type: String,
    enum: ["VENUE_TOUR","INAUGURATION","SESSION","FEEDBACK","REVIEW","VALEDICTORY"],
    required: true,
  },
  status: { type: String, enum: ["PENDING","APPROVED","REJECTED"], default: "PENDING" },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  uploadDate: { type: Date, default: Date.now },
  approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  approvalDate: { type: Date },
  remarks: { type: String },
  size: { type: Number },
  duration: { type: Number },
}, { timestamps: true });

export default mongoose.models.Video || mongoose.model("Video", VideoSchema);
