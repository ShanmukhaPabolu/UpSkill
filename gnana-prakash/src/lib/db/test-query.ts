import "./env-loader";
import connectDB from "./mongoose";
import Participant from "../../models/Participant";
import ParticipantAttendance from "../../models/ParticipantAttendance";
import Program from "../../models/Program";

async function run() {
  try {
    await connectDB();
    console.log("🔍 Running verification queries...");

    const email = "teacher1@gnana.edu.in";
    const employeeId = "EMP005";

    const participants = await Participant.find({
      $or: [
        { email: email.toLowerCase() },
        { employeeId: employeeId }
      ]
    }).populate("program");

    console.log(`\nFound ${participants.length} Participant registrations for teacher1@gnana.edu.in:`);
    
    for (const p of participants) {
      if (!p.program) {
        console.log(`- Participant ID: ${p._id} has NO program associated!`);
        continue;
      }
      const program = p.program as any;
      console.log(`\n- Program: "${program.programName}"`);
      console.log(`  Training Year: ${program.trainingYear}`);
      console.log(`  Total Days: ${program.totalDays}`);
      console.log(`  Certificate Issued: ${p.certificateIssued ? "YES" : "NO"}`);

      const dailyAttendance = await ParticipantAttendance.find({
        participant: p._id,
        program: program._id
      }).sort({ dayNumber: 1 });

      const presentCount = dailyAttendance.filter(a => a.status === "PRESENT").length;
      const absentCount = dailyAttendance.filter(a => a.status === "ABSENT").length;
      const percentage = program.totalDays > 0 ? Math.round((presentCount / program.totalDays) * 100) : 0;

      console.log(`  Attendance: ${percentage}% (${presentCount} present, ${absentCount} absent out of ${program.totalDays} days)`);
      console.log(`  Daily logs:`);
      dailyAttendance.forEach(a => {
        console.log(`    Day ${a.dayNumber} (${a.date.toISOString().split("T")[0]}): ${a.status}`);
      });
    }

    process.exit(0);
  } catch (err) {
    console.error("Error during query test:", err);
    process.exit(1);
  }
}

run();
