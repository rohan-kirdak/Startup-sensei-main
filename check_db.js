import mongoose from "mongoose";
import dotenv from "dotenv";
import Session from "./Backend/model/Session.js";
import User from "./Backend/model/User.js";
import Mentor from "./Backend/model/Mentor.js";

dotenv.config({ path: "./Backend/.env" });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/project-sensei");
    console.log("Connected to MongoDB successfully");

    const users = await User.find({}, "name email role");
    console.log("\n--- Users ---");
    console.log(users);

    const mentors = await Mentor.find({}).populate("user", "name email");
    console.log("\n--- Mentors ---");
    console.log(mentors);

    const sessions = await Session.find({})
      .populate("founder", "name email")
      .populate({
        path: "mentor",
        populate: { path: "user", select: "name email" }
      });
    console.log("\n--- Sessions ---");
    console.log(JSON.stringify(sessions, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
};

run();
