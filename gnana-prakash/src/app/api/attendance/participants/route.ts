import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import Participant from "@/models/Participant";
import ParticipantAttendance from "@/models/ParticipantAttendance";
import Attendance from "@/models/Attendance";
import Program from "@/models/Program";

// GET /api/attendance/participants
export async function GET(req: NextRequest) {
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const programId = searchParams.get("program");
    const teacherEmail = searchParams.get("email");
    const teacherEmpId = searchParams.get("employeeId");

    // 1. Fetch by teacher identifier for personal logs
    if (teacherEmail || teacherEmpId) {
      const query: any = {};
      if (teacherEmail) query.email = teacherEmail.toLowerCase();
      if (teacherEmpId) query.employeeId = teacherEmpId;

      const pRegs = await Participant.find(query).populate("program").lean();
      const results = [];

      for (const p of pRegs) {
        if (!p.program) continue;
        const prog = p.program as any;
        const logs = await ParticipantAttendance.find({
          participant: p._id,
          program: prog._id
        }).sort({ dayNumber: 1 }).lean();

        results.push({
          participantId: p._id,
          programId: prog._id,
          programName: prog.programName,
          status: prog.status,
          totalDays: prog.totalDays,
          startDate: prog.startDate,
          endDate: prog.endDate,
          category: p.category,
          certificateIssued: p.certificateIssued || false,
          certificateId: p.certificateId || "",
          attendanceLogs: logs.map((l: any) => ({
            dayNumber: l.dayNumber,
            date: l.date,
            status: l.status
          }))
        });
      }
      return NextResponse.json({ success: true, data: results });
    }

    // 2. Fetch all participants and their grid for a specific program
    if (!programId) {
      return NextResponse.json({ error: "Program ID or teacher email/employeeId required" }, { status: 400 });
    }

    const participants = await Participant.find({ program: programId }).lean();
    const attendanceRecords = await ParticipantAttendance.find({ program: programId }).lean();

    // Compile into participant status matrices
    const grid = participants.map((p: any) => {
      const history: Record<number, string> = {};
      attendanceRecords
        .filter((rec: any) => String(rec.participant) === String(p._id))
        .forEach((rec: any) => {
          history[rec.dayNumber] = rec.status;
        });

      return {
        ...p,
        history
      };
    });

    return NextResponse.json({ success: true, participants: grid });
  } catch (err: any) {
    console.error("GET detailed attendance error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/attendance/participants
// Saves daily checklist or bulk updates the grid and aggregates counts
export async function POST(req: NextRequest) {
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { programId, updates, dayNumber, date, attendance } = await req.json();

    if (!programId) {
      return NextResponse.json({ error: "Missing programId" }, { status: 400 });
    }

    const userRoleObj = session.user as any;
    const recordedBy = userRoleObj.id || userRoleObj._id || "648f95c479bd7856b3e7cb41";

    // Batch mode updates
    if (updates && Array.isArray(updates)) {
      const bulkOps = updates.map((up: any) => ({
        updateOne: {
          filter: { program: programId, participant: up.participantId, dayNumber: up.dayNumber },
          update: {
            $set: {
              date: new Date(up.date),
              status: up.status,
              recordedBy
            }
          },
          upsert: true
        }
      }));

      if (bulkOps.length > 0) {
        await ParticipantAttendance.bulkWrite(bulkOps);
      }

      // Re-sync all days that were updated in this batch
      const updatedDays = Array.from(new Set(updates.map((u: any) => u.dayNumber))) as number[];
      const allParticipants = await Participant.find({ program: programId }).lean();
      
      for (const day of updatedDays) {
        const dayAttendance = await ParticipantAttendance.find({ program: programId, dayNumber: day }).lean();
        const dateForDay = updates.find((u: any) => u.dayNumber === day)?.date || new Date();

        let sgt = 0, krp = 0, drp = 0, deoStaff = 0, ssStaff = 0, meo = 0, hm = 0, crp = 0, others = 0;

        allParticipants.forEach((p: any) => {
          const attRecord = dayAttendance.find((rec: any) => String(rec.participant) === String(p._id));
          const isPresent = attRecord?.status === "PRESENT";
          
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
        const attendancePercentage = allParticipants.length > 0 
          ? Math.round((totalAttendance / allParticipants.length) * 100) 
          : 0;

        await Attendance.findOneAndUpdate(
          { program: programId, dayNumber: day },
          {
            $set: {
              date: new Date(dateForDay),
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
              recordedBy
            }
          },
          { upsert: true, new: true }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Single day list mode updates
    if (!dayNumber || !date || !Array.isArray(attendance)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bulkOps = attendance.map((att: any) => ({
      updateOne: {
        filter: { program: programId, participant: att.participantId, dayNumber },
        update: {
          $set: {
            date: new Date(date),
            status: att.status,
            recordedBy
          }
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await ParticipantAttendance.bulkWrite(bulkOps);
    }

    // Recalculate and sync aggregate counts for this single day
    const allParticipants = await Participant.find({ program: programId }).lean();
    const dayAttendance = await ParticipantAttendance.find({ program: programId, dayNumber }).lean();

    let sgt = 0, krp = 0, drp = 0, deoStaff = 0, ssStaff = 0, meo = 0, hm = 0, crp = 0, others = 0;

    allParticipants.forEach((p: any) => {
      const attRecord = dayAttendance.find((rec: any) => String(rec.participant) === String(p._id));
      const isPresent = attRecord?.status === "PRESENT";
      
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
    const attendancePercentage = allParticipants.length > 0 
      ? Math.round((totalAttendance / allParticipants.length) * 100) 
      : 0;

    await Attendance.findOneAndUpdate(
      { program: programId, dayNumber },
      {
        $set: {
          date: new Date(date),
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
          recordedBy
        }
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST detailed attendance error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
