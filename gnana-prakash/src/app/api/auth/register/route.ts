import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { name, email, mobile, role, password } = await req.json();

    if (!name || !email || !mobile || !role || !password) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered." }, { status: 400 });
    }

    // Check if this is the very first user in the database
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    // Generate a temporary employeeId since it's required by the schema
    const employeeId = `REG-${Date.now().toString().slice(-6)}`;

    // Create the user. First user gets auto-approved as Super Admin.
    const newUser = new User({
      name,
      email,
      mobile,
      role: isFirstUser ? "SUPER_ADMIN" : role,
      password,
      employeeId,
      isActive: isFirstUser ? true : false,
    });

    await newUser.save();

    return NextResponse.json({ 
      success: true, 
      message: isFirstUser 
        ? "First user registered successfully as Super Admin." 
        : "Registration successful. Pending admin approval.",
      isAutoApproved: isFirstUser
    }, { status: 201 });

  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "An error occurred during registration." }, { status: 500 });
  }
}
