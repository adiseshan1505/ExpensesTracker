import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
    user: mongoose.Schema.Types.ObjectId;
    title: string;
    amount: number;
    category: string;
    date: Date;
    description?: string;
}

const ExpenseSchema: Schema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String }
}, { timestamps: true });

export const ExpenseModel = mongoose.model<IExpense>("Expense", ExpenseSchema);
