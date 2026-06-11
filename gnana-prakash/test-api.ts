import connectDB from "./src/lib/db/mongoose";
import Venue from "./src/models/Venue";

async function test() {
  try {
    await connectDB();
    console.log("Connected");
    const data = await Venue.find({}).populate("district", "name").populate("mandal", "name").limit(1).lean();
    console.log("Data:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
