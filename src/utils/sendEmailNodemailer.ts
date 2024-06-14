import nodemailer from "nodemailer";

type UserData = {
  email: string;
  subject: string;
  html: string;
};

const sendEmailUsingNodemailer = async ({ email, html, subject }: UserData) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `BudgetEase <${process.env.MY_EMAIL}>`,
    to: email,
    subject,
    html,
    // attachments: [
    //   {
    //     filename: "logo.png",
    //     path: "./logo.png",
    //     cid: "logo",
    //   },
    // ],
  };

  try {
    const res = await transporter.sendMail(mailOptions);

    console.log(res.response);
  } catch (error) {
    console.log(error);
  }
};

export default sendEmailUsingNodemailer;
