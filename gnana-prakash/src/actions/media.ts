"use server";
import { getCustomSession } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import Photo from "@/models/Photo";
import Video from "@/models/Video";
import AuditLog from "@/models/AuditLog";
import { revalidatePath } from "next/cache";

export async function approveMedia(id: string, type: "photo" | "video", action: "approve" | "reject", remarks?: string) {
  const session = await getCustomSession();
  if (!session) throw new Error("Unauthorized");
  const role = (session.user as any).role;
  if (!["SUPER_ADMIN","DISTRICT_ADMIN"].includes(role)) throw new Error("Forbidden");

  await connectDB();
  const status = action === "approve" ? "APPROVED" : "REJECTED";
  const Model = type === "photo" ? Photo : Video;

  await Model.findByIdAndUpdate(id, {
    status,
    approvedBy: (session.user as any).id,
    approvalDate: new Date(),
    remarks,
  });

  await AuditLog.create({
    user: (session.user as any).id,
    role,
    action: `MEDIA_${status}`,
    module: type.toUpperCase(),
    resourceId: id,
    details: { remarks },
  });

  revalidatePath("/super-admin/photos");
  revalidatePath("/super-admin/videos");
  revalidatePath("/district-admin/media");
  return { success: true };
}
