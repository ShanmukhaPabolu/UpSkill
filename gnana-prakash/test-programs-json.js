const mongoose = require("mongoose");
const fs = require("fs");

const ProgramSchema = new mongoose.Schema({}, { strict: false });
const Program = mongoose.models.Program || mongoose.model("Program", ProgramSchema);

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function run() {
  await mongoose.connect("mongodb+srv://jassubattula693_db_user:qAu4Vt59pfsOXhnX@cluster0.o88suvl.mongodb.net/gnana-prakash?appName=Cluster0");
  
  const programs = await Program.find({}).lean();
  const users = await User.find({}).lean();

  const output = {
    programsCount: programs.length,
    usersCount: users.length,
    programs: programs.map(p => ({
      _id: p._id,
      programName: p.programName,
      district: p.district,
      mandal: p.mandal,
      venue: p.venue,
      status: p.status
    })),
    users: users.map(u => ({
      _id: u._id,
      email: u.email,
      role: u.role,
      district: u.district,
      mandal: u.mandal,
      venue: u.venue
    }))
  };

  fs.writeFileSync("test-db-output.json", JSON.stringify(output, null, 2));
  console.log("Success! Output written to test-db-output.json");
  await mongoose.disconnect();
}

run().catch(err => {
  fs.writeFileSync("test-db-output.json", JSON.stringify({ error: err.message }, null, 2));
});
