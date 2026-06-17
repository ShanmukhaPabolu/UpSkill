const mongoose = require("mongoose");

// Define schemas to prevent StrictPopulateError
const District = mongoose.models.District || mongoose.model("District", new mongoose.Schema({ name: String }));
const Mandal = mongoose.models.Mandal || mongoose.model("Mandal", new mongoose.Schema({ name: String }));
const Venue = mongoose.models.Venue || mongoose.model("Venue", new mongoose.Schema({ name: String }));
const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({ name: String }));

const ProgramSchema = new mongoose.Schema({
  programName: String,
  district: { type: mongoose.Schema.Types.ObjectId, ref: "District" },
  mandal: { type: mongoose.Schema.Types.ObjectId, ref: "Mandal" },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});
const Program = mongoose.models.Program || mongoose.model("Program", ProgramSchema);

async function run() {
  await mongoose.connect("mongodb+srv://jassubattula693_db_user:qAu4Vt59pfsOXhnX@cluster0.o88suvl.mongodb.net/gnana-prakash?appName=Cluster0");
  console.log("Connected to MongoDB");

  try {
    const data = await Program.find({})
      .populate("district", "name")
      .populate("mandal", "name")
      .populate("venue", "name")
      .populate("createdBy", "name")
      .lean();
    console.log("SUCCESS! Programs count:", data.length);
    console.log("Programs names:", data.map(p => p.programName));
  } catch (err) {
    console.error("ERROR running find:", err);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
