import mongoose, { Schema } from "mongoose";

// Force delete from cache in development to ensure schema changes apply during hot reloading
if (mongoose.models && mongoose.models.Photo) {
  delete (mongoose.models as any).Photo;
}

const PhotoSchema = new Schema({
  program: { type: Schema.Types.ObjectId, ref: "Program", index: true, required: true },
  venue: { type: Schema.Types.ObjectId, ref: "Venue" },
  title: { type: String, required: true },
  description: { type: String },
  url: { type: String, required: true }, // Store base64 data URI here for MongoDB prototype storage
  filename: { type: String, default: "" },
  originalName: { type: String, default: "" },
  category: {
    type: String,
    enum: [
      "Food Distribution",
      "Inauguration Programs",
      "Classes & Workshops",
      "Residential Programs",
      "Events",
      "Awareness Campaigns",
      "Training Sessions",
      "Other Activities"
    ],
    required: true,
  },
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  uploadDate: { type: Date, default: Date.now },
  approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  approvalDate: { type: Date },
  remarks: { type: String },
  size: { type: Number, default: 0 },
  tags: [{ type: String }],
  platform: { type: String, default: "Gnana Prakash" },
  department: { type: String, default: "School Education" }
}, { timestamps: true });

PhotoSchema.index({ program: 1, status: 1 });
PhotoSchema.index({ category: 1, status: 1 });

export default mongoose.models.Photo || mongoose.model("Photo", PhotoSchema);
