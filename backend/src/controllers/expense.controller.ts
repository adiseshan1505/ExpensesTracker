import { ExpenseModel } from "../models/Expense";

export const getExpenses = async (req: any, res: any) => {
    try {
        const expenses = await ExpenseModel.find({ user: req.user.id }).sort({ date: -1 });
        res.json(expenses);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createExpense = async (req: any, res: any) => {
    try {
        const { title, amount, category, description, date } = req.body;
        const newExpense = await ExpenseModel.create({
            user: req.user.id,
            title,
            amount,
            category,
            description,
            date: date || new Date()
        });
        res.status(201).json(newExpense);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteExpense = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const expense = await ExpenseModel.findOneAndDelete({ _id: id, user: req.user.id });
        if (!expense) return res.status(404).json({ error: "Expense not found" });
        res.json({ message: "Expense deleted" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateExpense = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const updatedExpense = await ExpenseModel.findOneAndUpdate(
            { _id: id, user: req.user.id },
            req.body,
            { new: true }
        );
        if (!updatedExpense) return res.status(404).json({ error: "Expense not found" });
        res.json(updatedExpense);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
