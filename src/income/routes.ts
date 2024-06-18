import express from "express";
import * as incomeController from "./controller";

const router = express.Router();

router.post("/create-income", incomeController.createIncome);

router.get("/get-incomes", incomeController.getIncomes);

export default router;
