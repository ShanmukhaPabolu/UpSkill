import "./env-loader";
import mongoose from "mongoose";
import connectDB from "./mongoose";

import User from "../../models/User";
import District from "../../models/District";
import Mandal from "../../models/Mandal";
import Venue from "../../models/Venue";
import Program from "../../models/Program";
import Participant from "../../models/Participant";
import Attendance from "../../models/Attendance";
import ParticipantAttendance from "../../models/ParticipantAttendance";

const ALL_DISTRICTS = [
  "Alluri Sitharama Raju", "Anakapalli", "Anantapuramu", "Annamayya", "Bapatla", 
  "Chittoor", "Dr. B.R. Ambedkar Konaseema", "East Godavari", "Eluru", "Guntur", 
  "Kakinada", "Krishna", "Kurnool", "Markapuram", "Nandyal", "SPSR Nellore", 
  "NTR", "Palnadu", "Parvathipuram Manyam", "Polavaram", "Prakasam", 
  "Srikakulam", "Sri Sathya Sai", "Tirupati", "Visakhapatnam", "Vizianagaram", 
  "West Godavari", "YSR Kadapa"
];

async function seed() {
  try {
    await connectDB();
    console.log("🌱 Starting expanded seed with live attendance data...");

    // Clear existing
    await Promise.all([
      User.deleteMany({}), District.deleteMany({}), Mandal.deleteMany({}),
      Venue.deleteMany({}), Program.deleteMany({}), Participant.deleteMany({}),
      Attendance.deleteMany({}), ParticipantAttendance.deleteMany({})
    ]);

    // Create 28 Districts
    const districtDocs = await District.insertMany(
      ALL_DISTRICTS.map((name, i) => ({ 
        name, 
        code: `D${String(i+1).padStart(2, '0')}`,
        state: "Andhra Pradesh", 
        isActive: true 
      }))
    );
    console.log(`✅ Created ${districtDocs.length} districts`);

    // Create Mandals (at least 3 per district)
    const mandalData: any[] = [];
    districtDocs.forEach(d => {
      if (d.name === "Alluri Sitharama Raju") {
        mandalData.push(
          { name: "Paderu", code: "PDR", district: d._id, isActive: true },
          { name: "Araku Valley", code: "ARV", district: d._id, isActive: true },
          { name: "Chintapalle", code: "CTP", district: d._id, isActive: true }
        );
      } else if (d.name === "Anakapalli") {
        mandalData.push(
          { name: "Anakapalli", code: "AKP", district: d._id, isActive: true },
          { name: "Chodavaram", code: "CDV", district: d._id, isActive: true },
          { name: "Madugula", code: "MDG", district: d._id, isActive: true }
        );
      } else if (d.name === "Krishna") {
        mandalData.push(
          { name: "Machilipatnam", code: "MPT", district: d._id, isActive: true },
          { name: "Gudivada", code: "GDV", district: d._id, isActive: true },
          { name: "Pedana", code: "PDN", district: d._id, isActive: true }
        );
      } else {
        mandalData.push(
          { name: `${d.name} Urban`, code: `${d.code}-U`, district: d._id, isActive: true },
          { name: `${d.name} Rural`, code: `${d.code}-R`, district: d._id, isActive: true },
          { name: `${d.name} Central`, code: `${d.code}-C`, district: d._id, isActive: true }
        );
      }
    });
    const mandalDocs = await Mandal.insertMany(mandalData);
    console.log(`✅ Created ${mandalDocs.length} mandals`);

    // Create Venues (at least 3 per district)
    const venueData: any[] = [];
    districtDocs.forEach(d => {
      const distMandals = mandalDocs.filter(m => String(m.district) === String(d._id));
      
      venueData.push(
        {
          name: `Government ITI, ${d.name}`,
          address: `Industrial Estate, ${d.name}, AP`,
          district: d._id, mandal: distMandals[0]._id,
          contactPerson: `Principal, ITI ${d.name}`,
          contactNumber: `900${Math.floor(1000000 + Math.random() * 9000000)}`,
          email: `iti-${d.name.toLowerCase().replace(/ /g, "")}@edu.ap.gov.in`,
          infrastructure: { classroomsCount: 5, capacity: 60, projectors: true, smartBoards: false, wifi: true, drinkingWater: true, diningHall: false, parking: true },
          accommodation: { isResidential: false, acRooms: 0, nonAcRooms: 0, totalRooms: 0, totalBeds: 0, occupiedBeds: 0, availableBeds: 0 },
          isActive: true
        },
        {
          name: `Government Polytechnic, ${d.name}`,
          address: `Polytechnic Road, ${d.name}, AP`,
          district: d._id, mandal: distMandals[1]._id,
          contactPerson: `Principal, Polytechnic ${d.name}`,
          contactNumber: `910${Math.floor(1000000 + Math.random() * 9000000)}`,
          email: `poly-${d.name.toLowerCase().replace(/ /g, "")}@edu.ap.gov.in`,
          infrastructure: { classroomsCount: 15, capacity: 150, projectors: true, smartBoards: true, wifi: true, drinkingWater: true, diningHall: true, parking: true },
          accommodation: { isResidential: true, acRooms: 2, nonAcRooms: 20, totalRooms: 22, totalBeds: 60, occupiedBeds: 0, availableBeds: 60 },
          isActive: true
        },
        {
          name: `AP Skill Development Center, ${distMandals[2].name}`,
          address: `Skill Hub, ${distMandals[2].name}, AP`,
          district: d._id, mandal: distMandals[2]._id,
          contactPerson: `Coordinator, APSSDC`,
          contactNumber: `920${Math.floor(1000000 + Math.random() * 9000000)}`,
          email: `apssdc-${distMandals[2].name.toLowerCase().replace(/ /g, "")}@edu.ap.gov.in`,
          infrastructure: { classroomsCount: 4, capacity: 40, projectors: true, smartBoards: true, wifi: true, drinkingWater: true, diningHall: false, parking: true },
          accommodation: { isResidential: false, acRooms: 0, nonAcRooms: 0, totalRooms: 0, totalBeds: 0, occupiedBeds: 0, availableBeds: 0 },
          isActive: true
        }
      );
    });
    const venueDocs = await Venue.insertMany(venueData);
    console.log(`✅ Created ${venueDocs.length} venues`);

    // Create Admins
    const superAdmin = await User.create({
      employeeId: "EMP001", name: "System Administrator", email: "admin@gnana.edu.in", password: "Admin@1234",
      mobile: "9000000001", role: "SUPER_ADMIN", designation: "System Administrator", department: "School Education", isActive: true
    });

    const stateAdmin = await User.create({
      employeeId: "EMP003", name: "State Education Monitor", email: "state@gnana.edu.in", password: "Admin@1234",
      mobile: "9000000003", role: "STATE_ADMIN", designation: "State Education Director", department: "School Education", isActive: true
    });

    const districtAdmin = await User.create({
      employeeId: "EMP002", name: "Anakapalli District Admin", email: "dist-anakapalli@gnana.edu.in", password: "Admin@1234",
      mobile: "9000000002", role: "DISTRICT_ADMIN", district: districtDocs.find(d => d.name === "Anakapalli")?._id, designation: "District Education Officer", department: "School Education", isActive: true
    });

    const districtAdminKrishna = await User.create({
      employeeId: "EMP006", name: "Krishna District Admin", email: "dist-krishna@gnana.edu.in", password: "Admin@1234",
      mobile: "9000000006", role: "DISTRICT_ADMIN", district: districtDocs.find(d => d.name === "Krishna")?._id, designation: "District Education Officer", department: "School Education", isActive: true
    });

    const mandalAdmin = await User.create({
      employeeId: "EMP004", name: "Paderu Venue Admin", email: "venue-paderu@gnana.edu.in", password: "Admin@1234",
      mobile: "9000000004", role: "MANDAL_ADMIN", district: districtDocs.find(d => d.name === "Alluri Sitharama Raju")?._id, mandal: mandalDocs.find(m => m.name === "Paderu")?._id, designation: "Mandal Education Officer", isActive: true
    });

    const mandalAdminVjw = await User.create({
      employeeId: "EMP007", name: "Vijayawada Venue Admin", email: "venue-vjw@gnana.edu.in", password: "Admin@1234",
      mobile: "9000000007", role: "MANDAL_ADMIN", district: districtDocs.find(d => d.name === "Krishna")?._id, mandal: mandalDocs.find(m => m.name === "Machilipatnam")?._id, designation: "Mandal Education Officer", isActive: true
    });

    const teacher1 = await User.create({
      employeeId: "EMP005", name: "Krishna Teacher 1", email: "teacher1@gnana.edu.in", password: "Admin@1234",
      mobile: "9000000005", role: "TEACHER", district: districtDocs.find(d => d.name === "Krishna")?._id, mandal: mandalDocs.find(m => m.name === "Machilipatnam")?._id, venue: venueDocs.find(v => v.name.includes("Krishna"))?._id, designation: "School Assistant", department: "School Education", isActive: true
    });

    console.log("✅ Created user accounts");

    // ==========================================
    // SEED PROGRAMS AND ATTENDANCE
    // ==========================================
    const krishnaDist = districtDocs.find(d => d.name === "Krishna");
    const mptMandal = mandalDocs.find(m => m.name === "Machilipatnam");
    const polyKrishna = venueDocs.find(v => v.name.includes("Krishna")) || venueDocs[0];

    console.log("🌱 Seeding Programs...");
    // 1. Program A: Active 6-day training
    const programA = await Program.create({
      programName: "Gnana Prakash Year - 3 Certificate Course Training for SGTs at Ground Level",
      trainingYear: "2025-2026",
      department: "School Education",
      district: krishnaDist._id,
      mandal: mptMandal._id,
      venue: polyKrishna._id,
      startDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // Started 4 days ago
      endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
      totalDays: 6,
      expectedParticipants: 9,
      createdBy: superAdmin._id
    });

    // 2. Program B: Completed 3-day training
    const programB = await Program.create({
      programName: "Foundational Literacy & Numeracy (FLN) Teacher Training",
      trainingYear: "2025-2026",
      department: "School Education",
      district: krishnaDist._id,
      mandal: mptMandal._id,
      venue: polyKrishna._id,
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      status: "COMPLETED",
      totalDays: 3,
      expectedParticipants: 5,
      createdBy: superAdmin._id
    });

    console.log("✅ Seeded programs");

    // Register Participants for Program A
    const participantsAData = [
      { employeeId: "EMP005", name: "Krishna Teacher 1", email: "teacher1@gnana.edu.in", category: "SGT", mobile: "9000000005" },
      { employeeId: "EMP008", name: "Ravi Kumar", email: "ravi.sgt@gnana.edu.in", category: "SGT", mobile: "9876543210" },
      { employeeId: "EMP009", name: "A. Lakshmi", email: "lakshmi.krp@gnana.edu.in", category: "KRP", mobile: "9876543211" },
      { employeeId: "EMP010", name: "P. Srinivas", email: "srinivas.drp@gnana.edu.in", category: "DRP", mobile: "9876543212" },
      { employeeId: "EMP011", name: "M. Venkat", email: "venkat.meo@gnana.edu.in", category: "MEO", mobile: "9876543213" },
      { employeeId: "EMP012", name: "K. Ratnam", email: "ratnam.hm@gnana.edu.in", category: "HM", mobile: "9876543214" },
      { employeeId: "EMP013", name: "G. Satish", email: "satish.crp@gnana.edu.in", category: "CRP", mobile: "9876543215" },
      { employeeId: "EMP014", name: "S. Rama", email: "rama.deo@gnana.edu.in", category: "DEO_STAFF", mobile: "9876543216" },
      { employeeId: "EMP015", name: "T. Prasad", email: "prasad.ss@gnana.edu.in", category: "SS_OFFICE_STAFF", mobile: "9876543217" },
    ];

    const participantsA = await Participant.insertMany(
      participantsAData.map(p => ({
        ...p,
        schoolName: "Zilla Parishad High School, Krishna",
        designation: p.category === "SGT" ? "SGT Teacher" : p.category,
        district: krishnaDist._id,
        mandal: mptMandal._id,
        program: programA._id,
        isActive: true
      }))
    );

    // Register Participants for Program B (Completed FLN Training)
    const participantsBData = [
      { employeeId: "EMP005", name: "Krishna Teacher 1", email: "teacher1@gnana.edu.in", category: "SGT", mobile: "9000000005" },
      { employeeId: "EMP008", name: "Ravi Kumar", email: "ravi.sgt@gnana.edu.in", category: "SGT", mobile: "9876543210" },
      { employeeId: "EMP009", name: "A. Lakshmi", email: "lakshmi.krp@gnana.edu.in", category: "KRP", mobile: "9876543211" },
    ];

    const participantsB = await Participant.insertMany(
      participantsBData.map(p => ({
        ...p,
        schoolName: "Zilla Parishad High School, Krishna",
        designation: p.category === "SGT" ? "SGT Teacher" : p.category,
        district: krishnaDist._id,
        mandal: mptMandal._id,
        program: programB._id,
        certificateIssued: true, // Issue certificates for completed training
        certificateId: `CERT-FLN-${p.employeeId}`,
        isActive: true
      }))
    );

    console.log("✅ Registered participants into programs");

    // Seed daily attendance for Program A (Days 1 to 5)
    // Day 1 to 5 dates
    const dayDatesA = Array.from({ length: 5 }).map((_, i) => {
      const d = new Date(programA.startDate);
      d.setDate(d.getDate() + i);
      return d;
    });

    console.log("🌱 Seeding Attendance Logs for Program A (Days 1 to 5)...");
    for (let day = 1; day <= 5; day++) {
      const date = dayDatesA[day - 1];

      // Mark individual attendance statuses
      const dailyPresences: Record<string, boolean> = {};
      participantsA.forEach(p => {
        // Krishna Teacher 1 is PRESENT on Days 1, 2, 3, 5, but ABSENT on Day 4
        if (p.employeeId === "EMP005") {
          dailyPresences[p._id.toString()] = day !== 4;
        } else {
          // Others have some minor random absences
          dailyPresences[p._id.toString()] = Math.random() > 0.15;
        }
      });

      // Save ParticipantAttendance records
      const attRecords = [];
      for (const p of participantsA) {
        const isPresent = dailyPresences[p._id.toString()];
        const status = isPresent ? "PRESENT" : "ABSENT";
        attRecords.push({
          program: programA._id,
          participant: p._id,
          date,
          dayNumber: day,
          status,
          recordedBy: superAdmin._id
        });
      }
      await ParticipantAttendance.insertMany(attRecords);

      // Save aggregate counts
      let sgt = 0, krp = 0, drp = 0, deoStaff = 0, ssStaff = 0, meo = 0, hm = 0, crp = 0, others = 0;
      participantsA.forEach(p => {
        const isPresent = dailyPresences[p._id.toString()];
        if (isPresent) {
          const cat = p.category;
          if (cat === "SGT") sgt++;
          else if (cat === "KRP") krp++;
          else if (cat === "DRP") drp++;
          else if (cat === "DEO_STAFF") deoStaff++;
          else if (cat === "SS_OFFICE_STAFF") ssStaff++;
          else if (cat === "MEO") meo++;
          else if (cat === "HM") hm++;
          else if (cat === "CRP") crp++;
          else others++;
        }
      });

      const totalAttendance = sgt + krp + drp + deoStaff + ssStaff + meo + hm + crp + others;
      const attendancePercentage = Math.round((totalAttendance / participantsA.length) * 100);

      await Attendance.create({
        program: programA._id,
        date,
        dayNumber: day,
        sgt,
        krp,
        drp,
        deoStaff,
        ssStaff,
        meo,
        hm,
        crp,
        others,
        totalAttendance,
        attendancePercentage,
        recordedBy: superAdmin._id
      });
    }

    // Seed daily attendance for Program B (Days 1 to 3)
    console.log("🌱 Seeding Attendance Logs for Program B (Days 1 to 3)...");
    const dayDatesB = Array.from({ length: 3 }).map((_, i) => {
      const d = new Date(programB.startDate);
      d.setDate(d.getDate() + i);
      return d;
    });

    for (let day = 1; day <= 3; day++) {
      const date = dayDatesB[day - 1];

      // Everyone is present in Program B
      const attRecords = participantsB.map(p => ({
        program: programB._id,
        participant: p._id,
        date,
        dayNumber: day,
        status: "PRESENT",
        recordedBy: superAdmin._id
      }));
      await ParticipantAttendance.insertMany(attRecords);

      // Aggregate
      let sgt = 0, krp = 0, drp = 0, deoStaff = 0, ssStaff = 0, meo = 0, hm = 0, crp = 0, others = 0;
      participantsB.forEach(p => {
        const cat = p.category;
        if (cat === "SGT") sgt++;
        else if (cat === "KRP") krp++;
        else if (cat === "DRP") drp++;
        else if (cat === "DEO_STAFF") deoStaff++;
        else if (cat === "SS_OFFICE_STAFF") ssStaff++;
        else if (cat === "MEO") meo++;
        else if (cat === "HM") hm++;
        else if (cat === "CRP") crp++;
        else others++;
      });

      const totalAttendance = sgt + krp + drp + deoStaff + ssStaff + meo + hm + crp + others;
      const attendancePercentage = 100;

      await Attendance.create({
        program: programB._id,
        date,
        dayNumber: day,
        sgt,
        krp,
        drp,
        deoStaff,
        ssStaff,
        meo,
        hm,
        crp,
        others,
        totalAttendance,
        attendancePercentage,
        recordedBy: superAdmin._id
      });
    }

    console.log("\n🎉 Seed completed successfully!");
    console.log("  Super Admin:    admin@gnana.edu.in / Admin@1234");
    console.log("  State Admin:    state@gnana.edu.in / Admin@1234");
    console.log("  District Admin: dist-krishna@gnana.edu.in / Admin@1234");
    console.log("  Mandal Admin:   venue-vjw@gnana.edu.in / Admin@1234");
    console.log("  Teacher:        teacher1@gnana.edu.in / Admin@1234");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
