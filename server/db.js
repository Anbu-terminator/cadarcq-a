import mongoose from "mongoose";

import { config } from "./config.js";

export async function connectDb() {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(config.mongoUri, {
      dbName: config.dbName,
      serverSelectionTimeoutMS: 15000,
    });
  } catch (error) {
    console.error("\n[db] Could not connect to MongoDB:", error.message);
    console.error("[db] Check MONGODB_URI, the DB user/password, and (Atlas) Network Access allow-list.\n");
    process.exit(1);
  }
  console.log(`[db] Connected to MongoDB database "${config.dbName}"`);
}

export const adminsCollection = () => mongoose.connection.collection(config.adminsCollection);
