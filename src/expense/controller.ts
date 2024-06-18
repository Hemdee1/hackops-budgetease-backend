import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
interface paramType {
  categoryId: string;
}

interface reqBody {
  amount: number;
  balance: number;
}
export const createExpense: RequestHandler<
  paramType,
  unknown,
  reqBody,
  { user: string }
> = async (req, res) => {
  const userId = req.session.userId;
  const { user } = req.query;
  const { amount, balance } = req.body;
  const { categoryId } = req.params;

  try {
    if (!userId) {
      return res.status(500).json("login to log your expenses");
    }

    if (!categoryId) {
      return res
        .status(500)
        .json(
          "provide the id of the category you'll like to log an expense for"
        );
    }

    const budget = await prisma.budget.findFirst({ where: { userId } });

    if (!budget) {
      return res.status(500).json("you need a budget to create an expense");
    }

    const expense = await prisma.expense.create({
      data: { amount, balance, budgetId: budget.id, categoryId: categoryId },
    });

    if (user) {
      return res.redirect("/user/autologin");
    }

    res.status(200).json(expense);
  } catch (error: any) {
    console.log(error);
    res.status(500).json(error.message);
  }
};

export const getExpenses: RequestHandler = async (req, res) => {
  const userId = req.session.userId;
  try {
    if (!userId) {
      res.status(500).json("login to see your expenses");
    }

    const budget = await prisma.budget.findFirst({ where: { userId } });

    if (!budget) {
      res.status(500).json("no budget");
    }

    const expenses = await prisma.expense.findMany({
      where: { budgetId: budget?.id },
    });

    res.status(200).json(expenses);
  } catch (error: any) {
    console.log(error);
    res.status(500).json(error.message);
  }
};
