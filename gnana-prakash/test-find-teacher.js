const mongoose = require("mongoose");

const ParticipantSchema = new mongoose.Schema({}, { strict: false });
const Participant = mongoose.models.Participant || mongoose.model("Participant", ParticipantSchema);

async function run() {
  await mongoose.connect("mongodb+srv://jassubattula693_db_user:qAu4Vt59pfsOXhnX@cluster0.o88suvl.mongodb.net/gnana-prakash?appName=Cluster0");
  
  const participants = await Participant.find({ email: "teacher1@gnana.edu.in" }).lean();
  console.log("Teacher Participants found:", JSON.stringify(participants, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
