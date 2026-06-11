import mongoose, { Schema } from "mongoose";

const CustomFieldSchema = new Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  fieldType: { type: String, enum: ["TEXT","NUMBER","DATE","DROPDOWN","MULTI_SELECT","CHECKBOX","FILE_UPLOAD"], required: true },
  module: { type: String, required: true },
  options: [{ type: String }],
  isRequired: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.models.CustomField || mongoose.model("CustomField", CustomFieldSchema);
