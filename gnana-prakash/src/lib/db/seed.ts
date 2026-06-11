import mongoose from "mongoose";
import connectDB from "./mongoose";

// Import models
import User from "../../models/User";
import District from "../../models/District";
import Mandal from "../../models/Mandal";
import Venue from "../../models/Venue";
import Program from "../../models/Program";
import Participant from "../../models/Participant";
import Attendance from "../../models/Attendance";

const AP_DISTRICTS = [
  { name: "Krishna", code: "KRS" }, { name: "Guntur", code: "GNT" }, { name: "West Godavari", code: "WGD" },
  { name: "East Godavari", code: "EGD" }, { name: "Kurnool", code: "KNL" }, { name: "Kadapa", code: "KDP" },
  { name: "Prakasam", code: "PKM" }, { name: "Nellore", code: "NLR" }, { name: "Visakhapatnam", code: "VSP" },
  { name: "Vizianagaram", code: "VZM" }, { name: "Srikakulam", code: "SKL" }, { name: "Chittoor", code: "CTR" },
  { name: "Anantapur", code: "ATP" },
];

async function seed() {
  try {
    await connectDB();
    console.log("🌱 Starting seed...");

    const REAL_NAMES = [
      "Venkata Rao", "Srinivasulu Reddy", "Lakshmi Narayana", "Rama Krishna", "Siva Prasad",
      "Naga Babu", "Anuradha", "Sujatha", "Kavitha", "Madhuri",
      "Appa Rao", "Subba Reddy", "Chandra Sekhar", "Hari Krishna", "Venkateswarlu",
      "Padmavathi", "Sunitha", "Rajeshwari", "Nirmala", "Bhavani",
      "Ramesh Naidu", "Suresh Babu", "Ravi Kumar", "Kiran Kumar", "Naveen",
      "Saritha", "Aruna", "Vijaya", "Prasanthi", "Swapna"
    ];

    const REAL_SCHOOLS = [
      "ZPHS Patamata", "ZPHS Bhavanipuram", "MPUP School Benz Circle", "Government High School, Krishnalanka",
      "ZPHS Mangalagiri", "MPUP School Tadepalli", "Government High School, Arundelpet", "ZPHS Kothapeta",
      "ZPHS Rajahmundry Rural", "Government High School, Danavaipeta", "MPUP School Morampudi", "ZPHS Diwancheruvu",
      "ZPHS Kakinada Rural", "Government High School, Gandhinagar", "MPUP School Sarpavaram", "ZPHS Vakalapudi"
    ];

    // Clear existing
    await Promise.all([
      User.deleteMany({}), District.deleteMany({}), Mandal.deleteMany({}),
      Venue.deleteMany({}), Program.deleteMany({}), Participant.deleteMany({}),
      Attendance.deleteMany({}),
    ]);

    // Create districts
    const districts = await District.insertMany(AP_DISTRICTS.map(d => ({ ...d, state: "Andhra Pradesh", isActive: true })));
    console.log(`✅ Created ${districts.length} districts`);

    // Create mandals
    const mandals = await Mandal.insertMany([
      { name: "Vijayawada Urban", code: "VJW-U", district: districts[0]._id, isActive: true },
      { name: "Guntur Urban", code: "GNT-U", district: districts[1]._id, isActive: true },
      { name: "Rajahmundry", code: "RJY", district: districts[2]._id, isActive: true },
      { name: "Kakinada", code: "KKD", district: districts[3]._id, isActive: true },
    ]);
    console.log(`✅ Created ${mandals.length} mandals`);

    // Create super admin
    const superAdmin = await User.create({
      employeeId: "EMP001",
      name: "System Administrator",
      email: "admin@gnana.edu.in",
      password: "Admin@1234",
      mobile: "9000000001",
      role: "SUPER_ADMIN",
      designation: "System Administrator",
      department: "School Education",
      isActive: true,
    });

    // Create district admin
    const districtAdmin = await User.create({
      employeeId: "EMP002",
      name: "Krishna District Admin",
      email: "dist-krishna@gnana.edu.in",
      password: "Admin@1234",
      mobile: "9000000002",
      role: "DISTRICT_ADMIN",
      district: districts[0]._id,
      designation: "District Education Officer",
      department: "School Education",
      isActive: true,
    });

    // Create state admin
    await User.create({
      employeeId: "EMP003",
      name: "State Education Monitor",
      email: "state@gnana.edu.in",
      password: "Admin@1234",
      mobile: "9000000003",
      role: "STATE_ADMIN",
      designation: "State Education Director",
      department: "School Education",
      isActive: true,
    });

    // Create mandal admin
    const mandalAdmin = await User.create({
      employeeId: "EMP004",
      name: "Vijayawada Venue Admin",
      email: "venue-vjw@gnana.edu.in",
      password: "Admin@1234",
      mobile: "9000000004",
      role: "MANDAL_ADMIN",
      district: districts[0]._id,
      mandal: mandals[0]._id,
      designation: "Mandal Education Officer",
      isActive: true,
    });

    // Sample teachers
    for (let i = 0; i < 5; i++) {
      const name = REAL_NAMES[i];
      const emailName = name.toLowerCase().replace(/ /g, ".");
      await User.create({
        employeeId: `EMP10${i+1}`,
        name: name,
        email: `${emailName}@gnana.edu.in`,
        password: "Admin@1234",
        mobile: `900000010${i+1}`,
        role: "TEACHER",
        district: districts[i % 3]._id,
        designation: i % 2 === 0 ? "School Assistant" : "SGT",
        department: "School Education",
        isActive: true,
      });
    }

    // Sample students
    for (let i = 0; i < 5; i++) {
      const name = REAL_NAMES[i + 5] || `Student ${i+1}`;
      const emailName = name.toLowerCase().replace(/ /g, ".");
      await User.create({
        employeeId: `STU10${i+1}`,
        name: name,
        email: `${emailName}@gnana.edu.in`,
        password: "Admin@1234",
        mobile: `900000020${i+1}`,
        role: "STUDENT",
        district: districts[i % 3]._id,
        designation: "Student",
        department: "School Education",
        isActive: true,
      });
    }
    
    console.log("✅ Created users");

    // Create venues
    const venues = await Venue.insertMany([
      {
        name: "DIET Vijayawada",
        address: "District Institute of Education & Training, Vijayawada, Krishna District, AP - 520001",
        district: districts[0]._id, mandal: mandals[0]._id,
        contactPerson: "Dr. Suresh Kumar",
        contactNumber: "9876543210",
        email: "diet-vijayawada@edu.ap.gov.in",
        infrastructure: { classroomsCount: 12, capacity: 120, projectors: true, smartBoards: true, wifi: true, drinkingWater: true, diningHall: true, parking: true },
        accommodation: { isResidential: true, acRooms: 10, nonAcRooms: 20, totalRooms: 30, totalBeds: 60, occupiedBeds: 0, availableBeds: 60 },
        adminId: mandalAdmin._id, isActive: true,
      },
      {
        name: "DIET Guntur",
        address: "District Institute of Education & Training, Guntur, AP - 522001",
        district: districts[1]._id, mandal: mandals[1]._id,
        contactPerson: "Mrs. Lakshmi Devi",
        contactNumber: "9876543211",
        email: "diet-guntur@edu.ap.gov.in",
        infrastructure: { classroomsCount: 10, capacity: 100, projectors: true, smartBoards: false, wifi: true, drinkingWater: true, diningHall: true, parking: false },
        accommodation: { isResidential: true, acRooms: 5, nonAcRooms: 15, totalRooms: 20, totalBeds: 40, occupiedBeds: 0, availableBeds: 40 },
        isActive: true,
      },
      {
        name: "DIET Rajahmundry",
        address: "District Institute of Education & Training, Rajahmundry, West Godavari, AP - 533101",
        district: districts[2]._id, mandal: mandals[2]._id,
        contactPerson: "Mr. Ramesh Naidu",
        contactNumber: "9876543212",
        email: "diet-rjy@edu.ap.gov.in",
        infrastructure: { classroomsCount: 8, capacity: 80, projectors: true, smartBoards: false, wifi: false, drinkingWater: true, diningHall: true, parking: true },
        accommodation: { isResidential: false, acRooms: 0, nonAcRooms: 0, totalRooms: 0, totalBeds: 0, occupiedBeds: 0, availableBeds: 0 },
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${venues.length} venues`);

    // Create programs
    const programs = await Program.insertMany([
      {
        programName: "School Leadership & Management Training 2024",
        trainingYear: "2024-25",
        department: "School Education",
        district: districts[0]._id, mandal: mandals[0]._id, venue: venues[0]._id,
        serviceProvider: "State Institute of Educational Management & Training (SIEMAT)",
        startDate: new Date("2024-06-10"),
        endDate: new Date("2024-06-14"),
        status: "COMPLETED",
        totalDays: 5,
        expectedParticipants: 50,
        createdBy: superAdmin._id,
        tags: ["leadership", "management", "2024"],
      },
      {
        programName: "Digital Classroom Technology Training",
        trainingYear: "2024-25",
        department: "School Education",
        district: districts[1]._id, mandal: mandals[1]._id, venue: venues[1]._id,
        serviceProvider: "APSCERT",
        startDate: new Date("2024-07-15"),
        endDate: new Date("2024-07-19"),
        status: "ACTIVE",
        totalDays: 5,
        expectedParticipants: 60,
        createdBy: superAdmin._id,
        tags: ["digital", "technology", "2024"],
      },
      {
        programName: "Foundational Literacy & Numeracy (FLN) Training",
        trainingYear: "2024-25",
        department: "School Education",
        district: districts[2]._id, mandal: mandals[2]._id, venue: venues[2]._id,
        serviceProvider: "SSA Andhra Pradesh",
        startDate: new Date("2024-08-20"),
        endDate: new Date("2024-08-24"),
        status: "DRAFT",
        totalDays: 5,
        expectedParticipants: 80,
        createdBy: districtAdmin._id,
        tags: ["FLN", "foundational", "2024"],
      },
      {
        programName: "Special Education & Inclusive Learning",
        trainingYear: "2024-25",
        department: "School Education",
        district: districts[0]._id, mandal: mandals[0]._id, venue: venues[0]._id,
        serviceProvider: "NCERT",
        startDate: new Date("2024-09-10"),
        endDate: new Date("2024-09-13"),
        status: "DRAFT",
        totalDays: 4,
        expectedParticipants: 45,
        createdBy: superAdmin._id,
        tags: ["special-ed", "inclusive"],
      },
    ]);
    console.log(`✅ Created ${programs.length} programs`);

    // Create participants
    const categories = ["SGT","SCHOOL_ASSISTANT","GOVERNMENT_TEACHER","HM","CRP","KRP","DRP"] as const;
    const participantData = [];
    for (let i = 0; i < 30; i++) {
      const name = REAL_NAMES[i % REAL_NAMES.length];
      const school = REAL_SCHOOLS[i % REAL_SCHOOLS.length];
      const emailName = name.toLowerCase().replace(/ /g, ".");
      
      participantData.push({
        employeeId: `AP${String(i+1).padStart(6, "0")}`,
        name: name,
        mobile: `98765${String(43210 + i).padStart(5, "0")}`,
        email: `${emailName}${i > 0 ? i : ''}@edu.ap.gov.in`,
        schoolName: school,
        designation: i % 2 === 0 ? "School Assistant" : "SGT",
        category: categories[i % categories.length],
        district: ["Krishna", "Guntur", "West Godavari"][i % 3],
        mandal: ["Vijayawada", "Guntur", "Rajahmundry"][i % 3],
        program: programs[i % programs.length]._id,
        isResidential: i % 3 === 0,
        registrationDate: new Date(),
        certificateIssued: i % 5 === 0,
      });
    }
    await Participant.insertMany(participantData);
    console.log(`✅ Created 30 participants`);

    // Create Attendance records
    const attendanceData = [];
    for (const program of programs) {
      if (program.status !== "DRAFT") {
        for (let day = 1; day <= program.totalDays; day++) {
          // generate random attendance for each category
          const sgt = Math.floor(Math.random() * 20) + 10;
          const krp = Math.floor(Math.random() * 5) + 2;
          const drp = Math.floor(Math.random() * 5) + 2;
          const totalAttendance = sgt + krp + drp;
          const expected = program.expectedParticipants;
          const percentage = expected > 0 ? Math.round((totalAttendance / expected) * 100) : 0;
          
          attendanceData.push({
            program: program._id,
            date: new Date(program.startDate.getTime() + (day - 1) * 24 * 60 * 60 * 1000),
            dayNumber: day,
            sgt, krp, drp,
            totalAttendance,
            attendancePercentage: percentage > 100 ? 100 : percentage,
            recordedBy: districtAdmin._id,
            remarks: "All sessions ran smoothly",
          });
        }
      }
    }
    await Attendance.insertMany(attendanceData);
    console.log(`✅ Created ${attendanceData.length} attendance records`);

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📋 Demo Credentials:");
    console.log("  Super Admin:    admin@gnana.edu.in / Admin@1234");
    console.log("  District Admin: dist-krishna@gnana.edu.in / Admin@1234");
    console.log("  State Admin:    state@gnana.edu.in / Admin@1234");
    console.log("  Mandal Admin:   venue-vjw@gnana.edu.in / Admin@1234");
    console.log("  Teacher:        venkata.rao@gnana.edu.in / Admin@1234");
    console.log("  Student:        naga.babu@gnana.edu.in / Admin@1234");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
