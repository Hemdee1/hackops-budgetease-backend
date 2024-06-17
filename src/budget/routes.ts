import express from "express";
import * as budgetController from "./controller";
import { checkAuthUser } from "../mildleware/auth";

const router = express.Router();

router.post("/create-budget", checkAuthUser, budgetController.createBudget);

router.post("/delete-budget", checkAuthUser, budgetController.deleteBudget);

router.get("/get-budget", checkAuthUser, budgetController.getBudgets);

export default router;
