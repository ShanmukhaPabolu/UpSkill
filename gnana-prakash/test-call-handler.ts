// Set up environment variables first before importing modules
process.env.MONGODB_URI = "mongodb+srv://jassubattula693_db_user:qAu4Vt59pfsOXhnX@cluster0.o88suvl.mongodb.net/gnana-prakash?appName=Cluster0";
process.env.NEXTAUTH_SECRET = "gnana-prakash-tms-super-secret-key-2024-production";
process.env.MOCK_SESSION = "true";

import mongoose from "mongoose";

async function run() {
  const { GET } = await import("./src/app/api/programs/route");
  const { NextRequest } = await import("next/server");

  const req = new NextRequest("http://localhost:3000/api/programs?limit=100");
  
  console.log("Calling GET /api/programs...");
  const response = await GET(req);
  console.log("Status:", response.status);
  
  const json = await response.json();
  console.log("Response JSON data length:", json.data ? json.data.length : "undefined");
  console.log("Response JSON error:", json.error || "none");
  if (json.data && json.data.length > 0) {
    console.log("First Program:", json.data[0]);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
