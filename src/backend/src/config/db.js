import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
    console.log("Connect DB successfully");
  } catch (error) {
    console.error("Failed to connect DB: ", error);
    process.exit(1); // Exit the fail status (1: fail, 0: success)
  }
};
