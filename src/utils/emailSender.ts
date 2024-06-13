import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type UserData = {
  email: string;
  subject: string;
  html: string;
};

const sendMail = async ({ email, html, subject }: UserData) => {
  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [email],
    subject,
    html,
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
};

export default sendMail;
