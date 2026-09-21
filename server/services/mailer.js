const dns = require("dns");
const nodemailer = require("nodemailer");

dns.setDefaultResultOrder("ipv4first");

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailPort = Number(process.env.EMAIL_PORT || 465);
const emailSecure = process.env.EMAIL_SECURE
  ? process.env.EMAIL_SECURE === "true"
  : emailPort === 465;
let transporter;

if (!emailUser || !emailPass) {
  console.error("Email service is not configured. Set EMAIL_USER and EMAIL_PASS.");
}

const getTransporter = async () => {
  if (transporter) {
    return transporter;
  }

  const smtpHost = process.env.EMAIL_HOST ||
    (await dns.promises.resolve4("smtp.gmail.com"))[0];

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: emailPort,
    secure: emailSecure,
    ...(emailSecure ? {} : { requireTLS: true }),
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