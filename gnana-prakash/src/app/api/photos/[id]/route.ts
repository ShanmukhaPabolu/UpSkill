import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import connectDB from "@/lib/db/mongoose";
import Photo from "@/models/Photo";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const photo = await Photo.findById(id);
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Delete file
  try {
    await unlink(path.join(process.cwd(), "public", photo.url));
  } catch {}
  await Photo.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
