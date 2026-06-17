import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/getAuthToken";
import connectDB from "@/lib/db/mongoose";
import Photo from "@/models/Photo";
import Program from "@/models/Program";
import Participant from "@/models/Participant";

export async function GET(req: NextRequest) {
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    await connectDB();
    const { searchParams } = new URL(req.url);
    const program = searchParams.get("program");
    const status = searchParams.get("status") || "APPROVED"; // default to APPROVED for public view
    const category = searchParams.get("category");
    const platform = searchParams.get("platform");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");

    const query: Record<string, any> = {};
    
    const userRole = (session.user as any).role || "TEACHER";
    const isAdmin = ["SUPER_ADMIN", "STATE_ADMIN", "DISTRICT_ADMIN", "MANDAL_ADMIN", "VENUE_ADMIN"].includes(userRole);

    // 1. Data Visibility Filtering: Non-admin users only see images of programs they are registered in.
    if (!isAdmin) {
      const email = session.user.email || "";
      const employeeId = (session.user as any).employeeId || "";
      
      const registrations = await Participant.find({
        $or: [
          { email: email.toLowerCase() },
          { employeeId: employeeId }
        ]
      }).select("program").lean();
      
      const userProgramIds = registrations.map(r => r.program).filter(Boolean);
      
      if (program) {
        if (userProgramIds.some(id => String(id) === String(program))) {
          query.program = program;
        } else {
          return NextResponse.json({ data: [], total: 0, page, limit, totalPages: 0 });
        }
      } else {
        query.program = { $in: userProgramIds };
      }
    } else {
      if (program) {
        query.program = program;
      }
    }

    // 2. Status filter
    if (status !== "ALL") {
      query.status = status;
    }

    // 3. Category filter
    if (category && category !== "ALL") {
      query.category = category;
    }

    // 4. Platform filter
    if (platform && platform !== "ALL") {
      query.platform = platform;
    }

    // 5. Search query (matches title, description, or programName)
    if (search) {
      const matchingPrograms = await Program.find({
        programName: { $regex: search, $options: "i" }
      }).select("_id").lean();
      
      const matchedProgramIds = matchingPrograms.map(p => p._id);
      
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { program: { $in: matchedProgramIds } }
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Photo.find(query)
        .populate("program", "programName status department trainingYear")
        .populate("uploadedBy", "name role")
        .populate("approvedBy", "name")
        .sort({ uploadDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Photo.countDocuments(query),
    ]);

    return NextResponse.json({ 
      data, 
      total, 
      page, 
      limit, 
      totalPages: Math.ceil(total / limit) 
    });
  } catch (err: any) {
    console.error("GET photos error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getAuthToken(req);
    const session = token ? { user: token } : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const program = formData.get("program") as string;
    const category = formData.get("category") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const platform = formData.get("platform") as string;
    const department = formData.get("department") as string;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!program) return NextResponse.json({ error: "Program field is required" }, { status: 400 });
    if (!title) return NextResponse.json({ error: "Title field is required" }, { status: 400 });
    if (!category) return NextResponse.json({ error: "Category field is required" }, { status: 400 });

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." }, { status: 400 });

    // Convert file to base64 Data URI
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    await connectDB();

    const userRole = (session.user as any).role || "TEACHER";
    const isAdmin = ["SUPER_ADMIN", "STATE_ADMIN", "DISTRICT_ADMIN", "MANDAL_ADMIN", "VENUE_ADMIN"].includes(userRole);

    const status = isAdmin ? "APPROVED" : "PENDING";
    const userId = (session.user as any).id || (session.user as any)._id;

    // Build photo object supplying both old and new schema fields for complete compatibility
    const photo = await Photo.create({
      program,
      title,
      description: description || "",
      url: dataUrl,
      category,
      status,
      uploadedBy: userId,
      platform: platform || "Gnana Prakash",
      department: department || "School Education",
      approvedBy: isAdmin ? userId : undefined,
      approvalDate: isAdmin ? new Date() : undefined,
      filename: file.name || "uploaded_photo.jpg",
      originalName: file.name || "uploaded_photo.jpg",
      size: file.size || 0
    });

    return NextResponse.json({ success: true, data: photo }, { status: 201 });
  } catch (error: any) {
    console.error("POST photo error:", error);
    return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
  }
}
