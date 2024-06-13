import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { changePassword, loginUser, signUpUser } from "../utils/types";
import { hashData, verifyHashedData } from "../utils/hashData";
import { createToken, verifyToken } from "../utils/jwt";
import verifyEmailTemplate from "../utils/templates/verifyEmail";
import sendMail from "../utils/emailSender";
import { cloudinaryUploadImage } from "../utils/imageUploader";
import resetPasswordEmailTemplate from "../utils/templates/resetPassword";
import sendEmailUsingSMTPExpress from "../utils/sendEmail";
import sendEmailUsingNodemailer from "../utils/sendEmailNodemailer";

const prisma = new PrismaClient();
const url =
  process.env.NODE_ENV === "production"
    ? "https://budgetease-azure.vercel.app"
    : "http://localhost:3000";

const signUp: RequestHandler<unknown, unknown, signUpUser, unknown> = async (
  req,
  res
) => {
  let { email, firstName, lastName, password } = req.body;

  email = email.toLowerCase();

  try {
    if (!(email && firstName && lastName && password)) {
      // res.status(500).json("all credentials must be included");
      throw Error("all credentials must be included");
    }

    const existingUser = await prisma.user.findFirst({ where: { email } });

    if (existingUser) {
      // res.status(500).json("user already exists, login instead");
      throw Error("user already exists, login instead");
    }

    if (password.length < 8) {
      // res.status(500).json("password must be at least 8 characters long");
      throw Error("password must be at least 8 characters long");
    }

    const hashedPassword = await hashData(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        firstName,

        lastName,

        password: hashedPassword,
        avatar: "",
      },
    });

    const token = createToken(user.id);
    const link = `${url}/create/verify-email?token=${token}`;
    const data = {
      email: user.email,
      subject: "verify your account",
      html: verifyEmailTemplate({ firstName: user.firstName, link }),
    };

    // await sendMail(data);
    // await sendEmailUsingSMTPExpress(data);
    await sendEmailUsingNodemailer(data);

    res.status(200).json(user);
  } catch (error: any) {
    console.log(error);
    res.status(400).json(error.message);
  }
};
