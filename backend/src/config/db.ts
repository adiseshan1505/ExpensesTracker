import mongoose, { mongo } from "mongoose";
export const connectDB = async () => {
    try {
        const conn = process.env.MONGO_URL;
        if (!conn) {
            console.log("MONGO URL not in the env variables");
            process.exit(1);
        }
        await mongoose.connect(conn);
        console.log("Mongo DB connected");
    } catch (err) {
        console.log("Unable to connect to MONGO database", err);
        process.exit(1);
    }
}