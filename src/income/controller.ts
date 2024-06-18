import { PrismaClient } from "@prisma/client";
import { RequestHandler } from "express";
const prisma = new PrismaClient();
interface reqBody {
  amount: number;
  balance: number;
  title: string;
}
export const createIncome: RequestHandler<
  unknown,
  unknown,
  reqBody,
  { user: string }
> = async (req, res) => {
  const userId = req.session.userId;
  const { user } = req.query;
  const { amount, balance, title } = req.body;
  try {
    if (!userId) {
      return res.status(500).json("login to create an income");
    }

    const budget = await prisma.budget.findFirst({ where: { userId } });

    if (!budget) {
      return res.status(500).json("you need a budget to create an income");
    }

    const income = await prisma.income.create({
      data: { amount, balance, title, budgetId: budget.id },
    });

    if (user) {
      return res.redirect("/user/autologin");
    }

    res.status(200).json(income);
  } catch (error: any) {
    console.log(error);
    res.status(500).json(error.message);
  }
};

export const getIncomes: RequestHandler = async (req, res) => {
  const userId = req.session.userId;

  try {
    if (!userId) {
      res.status(500).json("login to see your incomes");
    }

    const budget = await prisma.budget.findFirst({ where: { userId } });

    if (!budget) {
      res.status(500).json("no budget");
    }

    const incomes = await prisma.income.findMany({
      where: { budgetId: budget?.id },
    });

    res.status(200).json(incomes);
  } catch (error: any) {
    console.log(error);
    res.status(500).json(error.message);
  }
};
