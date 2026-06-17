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
import FoodRecord from "../../models/FoodRecord";

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
      Attendance.deleteMany({}), ParticipantAttendance.deleteMany({}),
      FoodRecord.deleteMany({})
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
    console.log("🌱 Seeding Programs and attendance...");

    const MOCK_PARTICIPANTS_POOL = [
      { employeeId: "EMP101", name: "K. Satya Narayana", email: "satya.sgt@gnana.edu.in", category: "SGT", mobile: "9876540101" },
      { employeeId: "EMP102", name: "P. Rajeshwari", email: "rajeshwari.sgt@gnana.edu.in", category: "SGT", mobile: "9876540102" },
      { employeeId: "EMP103", name: "G. Srinivasa Rao", email: "srinivas.sgt@gnana.edu.in", category: "SGT", mobile: "9876540103" },
      { employeeId: "EMP104", name: "Ch. Lakshmi", email: "lakshmi.sgt@gnana.edu.in", category: "SGT", mobile: "9876540104" },
      { employeeId: "EMP105", name: "V. Rama Krishna", email: "ramakrishna.sgt@gnana.edu.in", category: "SGT", mobile: "9876540105" },
      { employeeId: "EMP106", name: "K. Durga Prasad", email: "durgaprasad.sgt@gnana.edu.in", category: "SGT", mobile: "9876540106" },
      { employeeId: "EMP107", name: "Y. Venkata Lakshmi", email: "venkatalakshmi.sgt@gnana.edu.in", category: "SGT", mobile: "9876540107" },
      { employeeId: "EMP108", name: "M. Bhaskara Rao", email: "bhaskar.sgt@gnana.edu.in", category: "SGT", mobile: "9876540108" },
      { employeeId: "EMP109", name: "S. Nageswara Rao", email: "nageswar.sgt@gnana.edu.in", category: "SGT", mobile: "9876540109" },
      { employeeId: "EMP110", name: "T. Anitha", email: "anitha.sgt@gnana.edu.in", category: "SGT", mobile: "9876540110" },
      { employeeId: "EMP201", name: "B. Venkateswarlu", email: "venkat.krp@gnana.edu.in", category: "KRP", mobile: "9876540201" },
      { employeeId: "EMP202", name: "S. Hymavathi", email: "hymavathi.krp@gnana.edu.in", category: "KRP", mobile: "9876540202" },
      { employeeId: "EMP301", name: "D. Madhusudhan", email: "madhu.drp@gnana.edu.in", category: "DRP", mobile: "9876540301" },
      { employeeId: "EMP302", name: "G. Kamala", email: "kamala.drp@gnana.edu.in", category: "DRP", mobile: "9876540302" },
      { employeeId: "EMP401", name: "R. Chalapathi", email: "chalapathi.meo@gnana.edu.in", category: "MEO", mobile: "9876540401" },
      { employeeId: "EMP402", name: "K. Vijaya Lakshmi", email: "vijaya.hm@gnana.edu.in", category: "HM", mobile: "9876540402" },
      { employeeId: "EMP501", name: "J. Rambabu", email: "rambabu.crp@gnana.edu.in", category: "CRP", mobile: "9876540501" },
      { employeeId: "EMP502", name: "P. Anuradha", email: "anuradha.deo@gnana.edu.in", category: "DEO_STAFF", mobile: "9876540502" },
      { employeeId: "EMP503", name: "M. Subbaraju", email: "subbaraju.ss@gnana.edu.in", category: "SS_OFFICE_STAFF", mobile: "9876540503" },
    ];

    async function seedProgramWithHistory(options: {
      programName: string;
      trainingYear: string;
      department: string;
      districtDoc: any;
      mandalDoc: any;
      venueDoc: any;
      startDate: Date;
      totalDays: number;
      expectedParticipants: number;
      status: string;
      participantsData: typeof MOCK_PARTICIPANTS_POOL;
    }) {
      const {
        programName,
        trainingYear,
        department,
        districtDoc,
        mandalDoc,
        venueDoc,
        startDate,
        totalDays,
        expectedParticipants,
        status,
        participantsData
      } = options;

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + totalDays - 1);

      const program = await Program.create({
        programName,
        trainingYear,
        department,
        district: districtDoc._id,
        mandal: mandalDoc._id,
        venue: venueDoc._id,
        startDate,
        endDate,
        status,
        totalDays,
        expectedParticipants,
        createdBy: superAdmin._id
      });

      const participants = await Participant.insertMany(
        participantsData.map(p => ({
          ...p,
          schoolName: `ZP High School, ${districtDoc.name}`,
          designation: p.category === "SGT" ? "SGT Teacher" : p.category,
          district: districtDoc._id.toString(),
          mandal: mandalDoc._id,
          program: program._id,
          certificateIssued: status === "COMPLETED",
          certificateId: status === "COMPLETED" ? `CERT-${program._id}-${p.employeeId}` : undefined,
          isActive: true
        }))
      );

      if (status === "COMPLETED" || status === "ACTIVE") {
        let daysToMark = totalDays;
        if (status === "ACTIVE") {
          const diffTime = Math.abs(Date.now() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          daysToMark = Math.min(diffDays, totalDays);
        }

        for (let day = 1; day <= daysToMark; day++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + day - 1);

          const dailyPresences: Record<string, boolean> = {};
          participants.forEach(p => {
            dailyPresences[p._id.toString()] = Math.random() > 0.1;
          });

          const attRecords = participants.map(p => ({
            program: program._id,
            participant: p._id,
            date,
            dayNumber: day,
            status: dailyPresences[p._id.toString()] ? "PRESENT" : "ABSENT",
            recordedBy: superAdmin._id
          }));
          await ParticipantAttendance.insertMany(attRecords);

          let sgt = 0, krp = 0, drp = 0, deoStaff = 0, ssStaff = 0, meo = 0, hm = 0, crp = 0, others = 0;
          participants.forEach(p => {
            if (dailyPresences[p._id.toString()]) {
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
          const attendancePercentage = Math.round((totalAttendance / participants.length) * 100);

          await Attendance.create({
            program: program._id,
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

          // Create Food Record for this day
          const foodCount = totalAttendance;
          await FoodRecord.create({
            program: program._id,
            date,
            dayNumber: day,
            breakfast: { quantity: foodCount, participants: foodCount, remarks: "Served fresh idly & chutney" },
            teaBreak: { quantity: foodCount, participants: foodCount, remarks: "Tea & biscuits" },
            lunch: { quantity: foodCount, participants: foodCount, remarks: "Rice, sambar, fry and papad" },
            snacks: { quantity: foodCount, participants: foodCount, remarks: "Samosa & tea" },
            dinner: { quantity: foodCount, participants: foodCount, remarks: "Roti & mixed veg curry" },
            recordedBy: superAdmin._id
          });
        }
      }
      return program;
    }

    const getDMW = (distName: string) => {
      const districtDoc = districtDocs.find(d => d.name === distName);
      if (!districtDoc) throw new Error(`District ${distName} not found`);
      const distMandals = mandalDocs.filter(m => String(m.district) === String(districtDoc._id));
      const distVenues = venueDocs.filter(v => String(v.district) === String(districtDoc._id));
      return {
        districtDoc,
        mandalDoc: distMandals[0],
        venueDoc: distVenues[0]
      };
    };

    // Seeding Jan 2026
    const dmwJan = getDMW("Krishna");
    await seedProgramWithHistory({
      programName: "Primary Teacher Mathematics Skill Enhancement Program",
      trainingYear: "2025-2026",
      department: "School Education",
      districtDoc: dmwJan.districtDoc,
      mandalDoc: dmwJan.mandalDoc,
      venueDoc: dmwJan.venueDoc,
      startDate: new Date("2026-01-12T09:00:00Z"),
      totalDays: 5,
      expectedParticipants: 15,
      status: "COMPLETED",
      participantsData: MOCK_PARTICIPANTS_POOL.slice(0, 15)
    });

    // Seeding Feb 2026
    const dmwFeb = getDMW("Anakapalli");
    await seedProgramWithHistory({
      programName: "English Language Intensive Pedagogy Training",
      trainingYear: "2025-2026",
      department: "School Education",
      districtDoc: dmwFeb.districtDoc,
      mandalDoc: dmwFeb.mandalDoc,
      venueDoc: dmwFeb.venueDoc,
      startDate: new Date("2026-02-09T09:00:00Z"),
      totalDays: 4,
      expectedParticipants: 12,
      status: "COMPLETED",
      participantsData: MOCK_PARTICIPANTS_POOL.slice(2, 14)
    });

    // Seeding Mar 2026
    const dmwMar = getDMW("Guntur");
    await seedProgramWithHistory({
      programName: "Science Lab and Inquiry-based Learning Course",
      trainingYear: "2025-2026",
      department: "School Education",
      districtDoc: dmwMar.districtDoc,
      mandalDoc: dmwMar.mandalDoc,
      venueDoc: dmwMar.venueDoc,
      startDate: new Date("2026-03-16T09:00:00Z"),
      totalDays: 3,
      expectedParticipants: 18,
      status: "COMPLETED",
      participantsData: MOCK_PARTICIPANTS_POOL.slice(0, 18)
    });

    // Seeding Apr 2026
    const dmwApr = getDMW("Kurnool");
    await seedProgramWithHistory({
      programName: "ICT and Digital Classroom Tools Training for HMs",
      trainingYear: "2025-2026",
      department: "School Education",
      districtDoc: dmwApr.districtDoc,
      mandalDoc: dmwApr.mandalDoc,
      venueDoc: dmwApr.venueDoc,
      startDate: new Date("2026-04-13T09:00:00Z"),
      totalDays: 6,
      expectedParticipants: 14,
      status: "COMPLETED",
      participantsData: MOCK_PARTICIPANTS_POOL.slice(4, 18)
    });

    // Seeding May 2026
    const dmwMay = getDMW("East Godavari");
    await seedProgramWithHistory({
      programName: "Child Psychology & Inclusive Classroom Management",
      trainingYear: "2025-2026",
      department: "School Education",
      districtDoc: dmwMay.districtDoc,
      mandalDoc: dmwMay.mandalDoc,
      venueDoc: dmwMay.venueDoc,
      startDate: new Date("2026-05-11T09:00:00Z"),
      totalDays: 4,
      expectedParticipants: 16,
      status: "COMPLETED",
      participantsData: MOCK_PARTICIPANTS_POOL.slice(1, 17)
    });

    // Seeding Jun 2026 (Completed)
    const dmwJun1 = getDMW("Krishna");
    await seedProgramWithHistory({
      programName: "Foundational Literacy & Numeracy (FLN) Teacher Training",
      trainingYear: "2025-2026",
      department: "School Education",
      districtDoc: dmwJun1.districtDoc,
      mandalDoc: dmwJun1.mandalDoc,
      venueDoc: dmwJun1.venueDoc,
      startDate: new Date("2026-06-01T09:00:00Z"),
      totalDays: 5,
      expectedParticipants: 15,
      status: "COMPLETED",
      participantsData: MOCK_PARTICIPANTS_POOL.slice(3, 18)
    });

    // Seeding Jun 2026 (Active)
    const dmwJunActive = getDMW("Alluri Sitharama Raju");
    await seedProgramWithHistory({
      programName: "Gnana Prakash Year - 3 Certificate Course Training for SGTs at Ground Level",
      trainingYear: "2025-2026",
      department: "School Education",
      districtDoc: dmwJunActive.districtDoc,
      mandalDoc: dmwJunActive.mandalDoc,
      venueDoc: dmwJunActive.venueDoc,
      startDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // Started 4 days ago
      totalDays: 6,
      expectedParticipants: 12,
      status: "ACTIVE",
      participantsData: MOCK_PARTICIPANTS_POOL.slice(0, 12)
    });

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
