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
    // Generate a temporary employeeId since it's required by the schema
    const employeeId = `REG-${Date.now().toString().slice(-6)}`;

    // Create the user but mark them as inactive.
    // They will need Super Admin approval to login.
    const newUser = new User({
      name,
      email,
      mobile,
      role,
      password,
      employeeId,
      isActive: false, // Critical: Requires approval
    });

    await newUser.save();

    return NextResponse.json({ success: true, message: "Registration successful. Pending admin approval." }, { status: 201 });

  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "An error occurred during registration." }, { status: 500 });
  }
}
