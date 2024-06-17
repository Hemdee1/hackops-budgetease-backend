import { RequestHandler } from "express";
import { category, createCategoryType } from "../utils/types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const createCategory: RequestHandler<
  unknown,
  unknown,
  createCategoryType,
  unknown
> = async (req, res) => {
  const { categories } = req.body;
  const userId = req.session.userId;

  try {
    if (!userId) {
      return res.status(500).json("login to select a catgeory");
    }
    if (categories.length == 0) {
      return res.status(500).json("select a category to get started");
    }

    const userBudget = await prisma.budget.findFirst({
      where: { userId: userId },
    });

    if (!userBudget) {
      return res
        .status(500)
        .json("you need to have a budget to create a category");
    }

    const budgetId = userBudget.id;

    const categoriesWithBudgetId = categories.map((category) => ({
      ...category,
      budgetId,
    }));

    const result = await prisma.category.createMany({
      data: categoriesWithBudgetId,
    });

    const newCategories = await prisma.category.findMany({
      where: {
        budgetId,
      },
    });

    return res.status(200).json(newCategories);
  } catch (error: any) {
    console.log(error);
    res.status(500).json(error.message);
  }
};
