import transporter from "./mailer.service.js";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

const sendEmail = async ({ to, subject, text }: EmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  await sendEmail({
    to: email,
    subject: "Welcome to Bankly ",
    text: `Hello ${name},

Welcome to Bankly!

Your account has been created successfully.

Thank you for joining us.`,
  });
};

export const sendLoginEmail = async (email: string, name: string) => {
  await sendEmail({
    to: email,
    subject: "New Login to Your Bankly",
    text: `Hello ${name},

You have successfully logged in to your Bankly.

If this wasn't you, please secure your account.`,
  });
};
