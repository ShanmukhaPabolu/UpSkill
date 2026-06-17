const mongoose = require("mongoose");
const fs = require("fs");

const ParticipantSchema = new mongoose.Schema({}, { strict: false });
const Participant = mongoose.models.Participant || mongoose.model("Participant", ParticipantSchema);

async function run() {
  await mongoose.connect("mongodb+srv://jassubattula693_db_user:qAu4Vt59pfsOXhnX@cluster0.o88suvl.mongodb.net/gnana-prakash?appName=Cluster0");
  
  const participants = await Participant.find({}).lean();
  fs.writeFileSync("test-participants.json", JSON.stringify(participants, null, 2));
  console.log("Written test-participants.json");
  await mongoose.disconnect();
}

run().catch(console.error);
