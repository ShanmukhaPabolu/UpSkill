const mongoose = require("mongoose");

const ProgramSchema = new mongoose.Schema({}, { strict: false });
const Program = mongoose.models.Program || mongoose.model("Program", ProgramSchema);

async function run() {
  await mongoose.connect("mongodb+srv://jassubattula693_db_user:qAu4Vt59pfsOXhnX@cluster0.o88suvl.mongodb.net/gnana-prakash?appName=Cluster0");
  console.log("Connected to MongoDB");

  // User definitions from our users list
  const users = [
    { name: "Super Admin", role: "SUPER_ADMIN" },
    { name: "Krishna District Admin", role: "DISTRICT_ADMIN", district: "6a3270bd07f0be9e2629739f" },
    { name: "Anakapalli District Admin", role: "DISTRICT_ADMIN", district: "6a3270bd07f0be9e26297395" },
    { name: "Paderu Venue Admin", role: "MANDAL_ADMIN", mandal: "6a3270bd07f0be9e262973b6" },
    { name: "Vijayawada Venue Admin", role: "MANDAL_ADMIN", mandal: "6a3270bd07f0be9e262973d7" },
    { name: "Teacher 1", role: "TEACHER", district: "6a3270bd07f0be9e2629739f", mandal: "6a3270bd07f0be9e262973d7", venue: "6a3270bd07f0be9e2629742f" }
  ];

  for (const user of users) {
    const query = {};
    const role = user.role;
    if (role === "DISTRICT_ADMIN") {
      query.district = user.district;
    } else if (["MANDAL_ADMIN", "VENUE_ADMIN"].includes(role)) {
      query.mandal = user.mandal;
    }

    const programs = await Program.find(query).lean();
    console.log(`\nUser: ${user.name} (Role: ${role})`);
    console.log(`Query: ${JSON.stringify(query)}`);
    console.log(`Programs found: ${programs.length}`);
    programs.forEach(p => {
      console.log(`- ${p.programName} (Status: ${p.status}, District: ${p.district}, Mandal: ${p.mandal})`);
    });
  }

  await mongoose.disconnect();
}

run().catch(console.error);
