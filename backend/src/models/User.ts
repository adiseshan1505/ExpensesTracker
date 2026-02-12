import mongoose, { mongo } from "mongoose";
import { Schema } from "mongoose";
export const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
export const UserModel = mongoose.model('Users', UserSchema);