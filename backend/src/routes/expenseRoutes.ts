import { Router } from "express";
import { createExpense, getExpenses, deleteExpense, updateExpense } from "../controllers/expense.controller";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.route("/")
    .get(getExpenses)
    .post(createExpense);

router.route("/:id")
    .delete(deleteExpense)
    .put(updateExpense);

export default router;
