const mongoose = require("mongoose");

// Initialize Mongoose schemas
const DistrictSchema = new mongoose.Schema({ name: String }, { strict: false });
const MandalSchema = new mongoose.Schema({ name: String }, { strict: false });
const VenueSchema = new mongoose.Schema({ name: String }, { strict: false });
const UserSchema = new mongoose.Schema({ name: String }, { strict: false });
const ProgramSchema = new mongoose.Schema({}, { strict: false });

const District = mongoose.models.District || mongoose.model("District", DistrictSchema);
const Mandal = mongoose.models.Mandal || mongoose.model("Mandal", MandalSchema);
const Venue = mongoose.models.Venue || mongoose.model("Venue", VenueSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Program = mongoose.models.Program || mongoose.model("Program", ProgramSchema);

async function run() {
  await mongoose.connect("mongodb+srv://jassubattula693_db_user:qAu4Vt59pfsOXhnX@cluster0.o88suvl.mongodb.net/gnana-prakash?appName=Cluster0");

  console.log("Connected successfully!");

  // Let's simulate the query in /api/programs/route.ts
  const query = {};
  
  // For Teacher, query is {}
  console.log("Simulating query for role: TEACHER (query = {})");
  const data = await Program.find(query)
    .populate("district", "name")
    .populate("mandal", "name")
    .populate("venue", "name")
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  console.log("Returned program data length:", data.length);
  console.log("Programs detail:", JSON.stringify(data, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
