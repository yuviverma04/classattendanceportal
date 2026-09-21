const dns = require("dns");
const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailProvider = (process.env.EMAIL_PROVIDER || "smtp").toLowerCase();
const emailFrom = process.env.EMAIL_FROM || emailUser;

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
  emailProvider === "brevo"
    ? sendWithBrevo(mailOptions)
    : (await getTransporter()).sendMail({
    from: `"Class Attendance Portal" <${emailUser}>`,
    ...mailOptions,
  });

const sendWithBrevo = async ({ to, subject, html, text }) => {
  if (!process.env.BREVO_API_KEY || !emailFrom) {
    throw new Error("BREVO_API_KEY and EMAIL_FROM are required for Brevo");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: emailFrom, name: "Class Attendance Portal" },
      to: [{ email: to }],
      subject,
      htmlContent: html || `<p>${text || ""}</p>`,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Brevo email failed (${response.status}): ${details}`);
  }
};

const verifyEmailConfig = async () => {
  if (emailProvider === "brevo") {
    if (!process.env.BREVO_API_KEY || !emailFrom) {
      throw new Error("BREVO_API_KEY and EMAIL_FROM are required for Brevo");
    }

    console.log("Brevo email service is configured");
    return;
  }

  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER and EMAIL_PASS are required for email delivery");
  }

  await (await getTransporter()).verify();
  console.log("Email service is ready");
};

module.exports = { sendMail, verifyEmailConfig };