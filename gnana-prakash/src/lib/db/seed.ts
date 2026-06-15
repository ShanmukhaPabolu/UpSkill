import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import connectDB from "./mongoose";

import User from "../../models/User";
import District from "../../models/District";
import Mandal from "../../models/Mandal";
import Venue from "../../models/Venue";
import Program from "../../models/Program";
import Participant from "../../models/Participant";
import Attendance from "../../models/Attendance";

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
    console.log("🌱 Starting expanded seed...");

    // Clear existing
    await Promise.all([
      User.deleteMany({}), District.deleteMany({}), Mandal.deleteMany({}),
      Venue.deleteMany({}), Program.deleteMany({}), Participant.deleteMany({}),
      Attendance.deleteMany({})
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

    const mandalAdmin = await User.create({
      employeeId: "EMP004", name: "Paderu Venue Admin", email: "venue-paderu@gnana.edu.in", password: "Admin@1234",
      mobile: "9000000004", role: "MANDAL_ADMIN", district: districtDocs.find(d => d.name === "Alluri Sitharama Raju")?._id, mandal: mandalDocs.find(m => m.name === "Paderu")?._id, designation: "Mandal Education Officer", isActive: true
    });

    console.log("✅ Created user accounts");
    console.log("\n🎉 Seed completed successfully!");
    console.log("  Super Admin:    admin@gnana.edu.in / Admin@1234");
    console.log("  State Admin:    state@gnana.edu.in / Admin@1234");
    console.log("  District Admin: dist-anakapalli@gnana.edu.in / Admin@1234");
    console.log("  Mandal Admin:   venue-paderu@gnana.edu.in / Admin@1234");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
