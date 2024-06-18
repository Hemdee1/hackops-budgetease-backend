import express from "express";
import * as expenseController from "./controller";

const router = express.Router();

router.post("/create-expense/:categoryId", expenseController.createExpense);

router.get("/get-expenses", expenseController.getExpenses);

export default router;
