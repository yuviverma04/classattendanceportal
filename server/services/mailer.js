const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailPort = Number(process.env.EMAIL_PORT || 465);
const emailSecure = process.env.EMAIL_SECURE
  ? process.env.EMAIL_SECURE === "true"
  : emailPort === 465;

if (!emailUser || !emailPass) {
  console.error("Email service is not configured. Set EMAIL_USER and EMAIL_PASS.");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: emailPort,
  secure: emailSecure,
  ...(emailSecure ? {} : { requireTLS: true }),
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  family: 4,
});

const sendMail = (mailOptions) =>
  transporter.sendMail({
    from: `"Class Attendance Portal" <${emailUser}>`,
    ...mailOptions,
  });

const verifyEmailConfig = async () => {
  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER and EMAIL_PASS are required for email delivery");
  }

  await transporter.verify();
  console.log("Email service is ready");
};

module.exports = { sendMail, verifyEmailConfig };