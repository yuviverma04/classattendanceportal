const dns = require("dns");
const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  console.error("Email service is not configured. Set EMAIL_USER and EMAIL_PASS.");
}

let transporter;

const getTransporter = async () => {
  if (transporter) {
    return transporter;
  }

  const smtpIp = (await dns.promises.resolve4("smtp.gmail.com"))[0];

  transporter = nodemailer.createTransport({
    host: smtpIp,
    port: 587,
    secure: false,
    requireTLS: true,
    tls: {
      servername: "smtp.gmail.com",
    },
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  return transporter;
};

const sendMail = async (mailOptions) =>
  (await getTransporter()).sendMail({
    from: `"Class Attendance Portal" <${emailUser}>`,
    ...mailOptions,
  });

const verifyEmailConfig = async () => {
  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER and EMAIL_PASS are required for email delivery");
  }

  await (await getTransporter()).verify();
  console.log("Email service is ready");
};

module.exports = { sendMail, verifyEmailConfig };