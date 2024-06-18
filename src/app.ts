import "dotenv/config";
import express from "express";
import cors from "cors";
import userRoutes from "./User/userRoutes";
import budgetRoutes from "./budget/routes";
import categoryRoutes from "./category/routes";
import expenseRoutes from "./expense/routes";
import incomeRoutes from "./income/routes";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { getRates } from "./rate/controller";

const app = express();

const origin =
  process.env.NODE_ENV === "production"
    ? "https://budgetease-azure.vercel.app"
    : "http://localhost:3000";

// middlewares
app.use(
  cors({
    origin,
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// express session
const PostgresqlStore = connectPgSimple(session);
const sessionStore = new PostgresqlStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: true,
});

app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000 * 24 * 3, //3 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
    store: sessionStore,
  })
);

app.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "Welecome to BudgetEase Backend API Service" });
});

app.use("/user", userRoutes);
app.use("/budget", budgetRoutes);
app.use("/category", categoryRoutes);
app.use("/expense", expenseRoutes);
app.use("/income", incomeRoutes);
app.get("/rates", getRates);

app.listen(process.env.PORT, () => {
  console.log(`server ready and listening on port:${process.env.PORT}`);
});

export default app;
