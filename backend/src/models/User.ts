import mongoose, { mongo } from "mongoose";
import { Schema } from "mongoose";
export const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isTwoFactorEnabled: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date }
});
export const UserModel = mongoose.model('Users', UserSchema);