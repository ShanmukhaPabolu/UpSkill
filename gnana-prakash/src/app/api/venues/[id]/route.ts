import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import connectDB from "@/lib/db/mongoose";
import Venue from "@/models/Venue";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const venue = await Venue.findById(params.id).populate("district mandal").lean();
  if (!venue) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(venue);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !["SUPER_ADMIN","DISTRICT_ADMIN"].includes((session.user as any).role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const body = await req.json();
  const venue = await Venue.findByIdAndUpdate(params.id, body, { new: true });
  if (!venue) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(venue);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  await Venue.findByIdAndUpdate(params.id, { isActive: false });
  return NextResponse.json({ success: true });
}
