import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/mongoose";
import Photo from "@/models/Photo";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    let token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: process.env.NODE_ENV === 'production' || req.url.startsWith('https://') });
    if (!token) token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: false });
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const program = searchParams.get("program");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query: Record<string, unknown> = {};
    if (program) query.program = program;
    if (status) query.status = status;
    if (category) query.category = category;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Photo.find(query).populate("uploadedBy", "name").populate("approvedBy", "name").sort({ uploadDate: -1 }).skip(skip).limit(limit).lean(),
      Photo.countDocuments(query),
    ]);
    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: process.env.NODE_ENV === 'production' || req.url.startsWith('https://') });
    if (!token) token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: false });
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const program = formData.get("program") as string;
    const category = formData.get("category") as string;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop();
    const filename = `photo_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "photos");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    await connectDB();
    const photo = await Photo.create({
      program: program || undefined,
      filename,
      originalName: file.name,
      url: `/uploads/photos/${filename}`,
      category: category || "VENUE",
      status: "PENDING",
      uploadedBy: (session.user as any).id,
      size: file.size,
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
