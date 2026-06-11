"use server";
import { getCustomSession } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import Program from "@/models/Program";
import AuditLog from "@/models/AuditLog";
import { revalidatePath } from "next/cache";
import { programSchema } from "@/lib/validations";

export async function createProgram(formData: FormData) {
  const session = await getCustomSession();
  if (!session) throw new Error("Unauthorized");

  const rawData = Object.fromEntries(formData);
  const parsed = programSchema.safeParse({
    ...rawData,
    expectedParticipants: Number(rawData.expectedParticipants) || 0,
  });

  if (!parsed.success) throw new Error("Validation failed");

  await connectDB();
  const start = new Date(parsed.data.startDate);
  const end = new Date(parsed.data.endDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const program = await Program.create({
    ...parsed.data,
    totalDays,
    createdBy: (session.user as any).id,
  });

  await AuditLog.create({
    user: (session.user as any).id,
    role: (session.user as any).role,
    action: "CREATE",
    module: "PROGRAM",
    resourceId: program._id.toString(),
    details: { programName: program.programName },
  });

  revalidatePath("/super-admin/programs");
  return { success: true, id: program._id.toString() };
}

export async function updateProgramStatus(id: string, status: string) {
  const session = await getCustomSession();
  if (!session) throw new Error("Unauthorized");
  await connectDB();
  await Program.findByIdAndUpdate(id, { status });
  await AuditLog.create({
    user: (session.user as any).id,
    role: (session.user as any).role,
    action: "STATUS_CHANGE",
    module: "PROGRAM",
    resourceId: id,
    details: { status },
  });
  revalidatePath("/super-admin/programs");
  return { success: true };
}
