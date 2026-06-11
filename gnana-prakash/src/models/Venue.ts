import mongoose, { Schema, Document } from "mongoose";

const VenueSchema = new Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  district: { type: Schema.Types.ObjectId, ref: "District", required: true, index: true },
  mandal: { type: Schema.Types.ObjectId, ref: "Mandal", required: true },
  contactPerson: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, lowercase: true },
  infrastructure: {
    classroomsCount: { type: Number, default: 0 },
    capacity: { type: Number, default: 0 },
    projectors: { type: Boolean, default: false },
    smartBoards: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    drinkingWater: { type: Boolean, default: true },
    diningHall: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
  },
  accommodation: {
    isResidential: { type: Boolean, default: false },
    acRooms: { type: Number, default: 0 },
    nonAcRooms: { type: Number, default: 0 },
    totalRooms: { type: Number, default: 0 },
    totalBeds: { type: Number, default: 0 },
    occupiedBeds: { type: Number, default: 0 },
    availableBeds: { type: Number, default: 0 },
  },
  photos: [{ type: String }],
  adminId: { type: Schema.Types.ObjectId, ref: "User" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Venue || mongoose.model("Venue", VenueSchema);
