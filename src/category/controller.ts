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

interface editBody {
  id: string;
  percent: number;
}

interface reqBody {
  editBody: editBody[];
  categories: category[];
}
export const updateCategory: RequestHandler<
  unknown,
  unknown,
  reqBody,
  unknown
> = async (req, res) => {
  const userId = req.session.userId;
  const editCategory: editBody[] = req.body.editBody;
  const categories: category[] = req.body.categories;
  try {
    if (!userId) {
      return res.status(500).json("you have to login to edit your category");
    }
    if (editCategory.length > 0) {
      await Promise.all(
        editCategory.map(async (e) => {
          await prisma.category.update({
            data: { percent: e.percent },
            where: { id: e.id },
          });
        })
      );
    }

    if (categories.length > 0) {
      const budget = await prisma.budget.findFirst({
        where: { userId: userId },
      });

      if (!budget) {
        return res.status(500).json("you need a budget to create a category");
      }

      const budgetId = budget?.id;

      const categoriesWithBudgetId = categories.map((c) => ({
        ...c,
        budgetId,
      }));

      const newCategories = await prisma.category.createMany({
        data: categoriesWithBudgetId,
      });
    }

    res.status(200).json("Categories updated and added successfully");
  } catch (error: any) {
    console.log(error);
    res.status(500).json(error.message);
  }
};

export const getCategories: RequestHandler = async (req, res) => {
  const userId = req.session.userId;
  try {
    if (!userId) {
      return res.status(500).json("login to see the list of your categories");
    }
    const budget = await prisma.budget.findFirst({ where: { userId: userId } });
    if (!budget) {
      return res
        .status(500)
        .json("you need to create a budget in other to have categories");
    }
    const budgetId = budget.id;

    const categories = await prisma.category.findMany({
      where: { budgetId: budgetId },
    });

    res.status(200).json(categories);
  } catch (error: any) {
    console.log(error);
    res.status(500).json(error.message);
  }
};
