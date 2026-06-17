const mongoose = require("mongoose");

const ProgramSchema = new mongoose.Schema({}, { strict: false });
const Program = mongoose.models.Program || mongoose.model("Program", ProgramSchema);

async function run() {
  await mongoose.connect("mongodb+srv://jassubattula693_db_user:qAu4Vt59pfsOXhnX@cluster0.o88suvl.mongodb.net/gnana-prakash?appName=Cluster0");
  console.log("Connected successfully!");

  const programs = await Program.find({}).lean();
  console.log("ALL PROGRAMS IN DB:");
  console.log(JSON.stringify(programs, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
