import mongoose, { mongo } from "mongoose";
import { Schema } from "mongoose";
export const UserSchema = new Schema({
    name: { type: String, default: "User" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isTwoFactorEnabled: { type: Boolean, default: true },
    otp: { type: String },
    otpExpires: { type: Date },
    budget: { type: Number, default: 0 },
    profilePicture: { type: String }
});

UserSchema.pre('deleteOne', { document: true, query: false }, async function () {
    await mongoose.model('Expense').deleteMany({ user: this._id });
});

export const UserModel = mongoose.model('Users', UserSchema);