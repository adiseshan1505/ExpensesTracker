import mongoose, { mongo } from "mongoose";
export const connectDB = async () => {
    try {
        if (!process.env.MONGO_URL) {
            console.log("MONGO URL not in the env variables");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Mongo DB connected");
    } catch (err) {
        console.log("Unable to connect to MONGO database", err);
        process.exit(1);
    }
}