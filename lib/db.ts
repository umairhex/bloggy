import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

export const connectToDB = async () => {
    if (isConnected) {
        console.log("Already connected to MongoDB");
        return;
    }

    if (!MONGODB_URI) {
        throw new Error("Please provide MongoDB URI");
    }

    try {
        await mongoose.connect(MONGODB_URI);
        isConnected = true;
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
};