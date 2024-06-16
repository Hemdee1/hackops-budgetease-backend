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

const logIn: RequestHandler<unknown, unknown, loginUser, unknown> = async (
  req,
  res
) => {
  let { email, password } = req.body;

  email = email.toLowerCase();

  try {
    if (!(email && password)) {
      throw Error("all credentials must be included");
    }

    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        budget: {
          include: {
            category: {
              include: {
                expense: true,
              },
            },
            income: true,
            expense: true,
          },
        },
      },
    });

    if (!user) {
      throw Error("Incorrect credentials");
    }

    const passowrdMatch = await verifyHashedData(password, user?.password!);

    if (!passowrdMatch) {
      throw Error("Incorrect credentials");
    }

    if (!user.verified) {
      //   // send a link to verify email
      const token = createToken(user.id);
      const link = `${url}/create/verify-email?token=${token}`;

      const data = {
        email: user.email,
        subject: "Verify your account",
        html: verifyEmailTemplate({ firstName: user.firstName, link }),
      };

      // await sendMail(data);
      // await sendEmailUsingSMTPExpress(data)
      await sendEmailUsingNodemailer(data);

      throw Error("Email is not verified!");
    }

    req.session.userId = user.id;

    // exclude password
    user.password = "";

    res.status(200).json(user);
  } catch (error: any) {
    console.log(error);
    res.status(400).json(error.message);
  }
};

const verifyEmail: RequestHandler = async (req, res) => {
  const token = req.params.token;

  try {
    const id = verifyToken(token!);

    if (!id) {
      // res
      //   .status(500)
      //   .json("The link has expired or invalid, please generate another link");
      throw Error(
        "The link has expired or invalid, please generate another link"
      );
    }

    await prisma.user.update({ data: { verified: true }, where: { id } });

    res.status(200).json("email verified successfully");
  } catch (error: any) {
    console.log(error);
    res.status(400).json(error.message);
  }
};

const updateProfile: RequestHandler = async (req, res) => {
  const userId = req.session.userId;
  const body = req.body;
  const avatar = body?.avatar;

  try {
    if (!userId) {
      // res.status(500).json("user not authenticated");
      throw Error("user not authenticated");
    }
    if (avatar) {
      const res = await cloudinaryUploadImage(body.avatar, userId);
      if (res?.secure_url) {
        await prisma.user.update({
          where: { id: userId },
          data: { avatar: res.secure_url },
        });
      } else {
        throw Error("avatar upload failed");
      }
    } else {
      await prisma.user.update({ data: { ...body }, where: { id: userId } });
    }

    res.status(201).json("information upgraded succesfully");
  } catch (error: any) {
    console.log(error);
    res.status(400).json(error.message);
  }
};

const sendPasswordLink: RequestHandler<
  unknown,
  unknown,
  changePassword,
  unknown
> = async (req, res) => {
  let { email } = req.body;

  email = email.toLowerCase();

  try {
    if (!email) {
      // res.status(500).json("Email is required");
      throw Error("Email is required");
    }

    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      // res.status(500).json(" no user found");
      throw Error("No user found");
    }

    const token = createToken(user.id);
    const link = `${url}/create/reset-password?token=${token}`;

    const data = {
      email: user.email,
      subject: "Reset Your Password",
      html: resetPasswordEmailTemplate({ firstName: user.firstName, link }),
    };

    // await sendMail(data);
    // await sendEmailUsingSMTPExpress(data);
    await sendEmailUsingNodemailer(data);

    res.status(200).json("link sent successfully");
  } catch (error: any) {
    console.log(error);
    res.status(400).json(error.message);
  }
};

const resetPassword: RequestHandler = async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;

  try {
    if (!password) {
      // res.status(500).json("password is required");
      throw Error("password is required");
    }

    if (password.length < 8) {
      // res.status(500).json("Password must be at least 8 characters long");
      throw Error("Password must be at least 8 characters long");
    }

    const id = verifyToken(token!);
    if (!id) {
      // res
      //   .status(500)
      //   .json("The link is expired or invalid, please generate another link");
      throw Error(
        "The link is expired or invalid, please generate another link"
      );
    }

    const hashedPassword = await hashData(password, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    res.status(201).json("password change succesfully");
  } catch (error: any) {
    console.log(error);
    res.status(400).json(error.message);
  }
};

const autoLogin: RequestHandler = async (req, res) => {
  const userId = req.session.userId;

  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
      include: {
        budget: {
          include: {
            category: {
              include: {
                expense: true,
              },
            },
            income: true,
            expense: true,
          },
        },
      },
    });

    if (!user) {
      // res.status(500).json("no user available, please login");
      throw Error("no user available, please login");
    }

    // exclude password
    user.password = "";

    res.status(200).json(user);
  } catch (error: any) {
    console.log(error);
    res.status(400).json(error.message);
  }
};

const logOut: RequestHandler = async (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.log(error);
      res.sendStatus(400);
    } else {
      res.json("logout successfully");
    }
  });
};

const getUser: RequestHandler = async (req, res) => {
  const id = req.params.id;
  try {
    const users = await prisma.user.findFirst({ where: { id } });

    res.status(200).json(users);
  } catch (error: any) {
    console.log(error);
    res.status(400).json(error.message);
  }
};

const getAllUser: RequestHandler = async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.status(200).json(users);
  } catch (error: any) {
    console.log(error);
    res.status(400).json(error.message);
  }
};

export {
  signUp,
  logIn,
  verifyEmail,
  updateProfile,
  // endpoint to create and send token for password reset
  sendPasswordLink,
  // endpoint to update password
  resetPassword,
  // endpoint to get authenticated user
  autoLogin,
  logOut,
  getUser,
  getAllUser,
};
