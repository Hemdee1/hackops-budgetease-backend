import { createClient } from "smtpexpress";

type UserData = {
  email: string;
  subject: string;
  html: string;
};

const PROJECT_ID = process.env.PROJECT_ID;
const PROJECT_SECRET = process.env.PROJECT_SECRET;
const SENDER_ADDRESS = process.env.SENDER_ADDRESS;

const sendEmailUsingSMTPExpress = async ({
  email,
  html,
  subject,
}: UserData) => {
  const smtpexpressClient = createClient({
    projectId: PROJECT_ID!,
    projectSecret: PROJECT_SECRET!,
  });

  const res = await smtpexpressClient.sendApi.sendMail({
    subject,
    message: html,
    sender: {
      name: "budgetEase",
      email: SENDER_ADDRESS!,
    },
    recipients: {
      // name: "My recipient's name",
      email,
    },
  });

  console.log(res);
};

export default sendEmailUsingSMTPExpress;
