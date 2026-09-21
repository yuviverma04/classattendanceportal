const dns = require("dns");
const nodemailer = require("nodemailer");

dns.setDefaultResultOrder("ipv4first");

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailProvider = (process.env.EMAIL_PROVIDER || "smtp").toLowerCase();
const emailFrom = process.env.EMAIL_FROM || emailUser;
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

const sendWithResend = async ({ to, subject, html, text }) => {
  if (!process.env.RESEND_API_KEY || !emailFrom) {
    throw new Error("RESEND_API_KEY and EMAIL_FROM are required for Resend");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend email failed (${response.status}): ${details}`);
  }
};

const getGmailAccessToken = async () => {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID,
      client_secret: process.env.GMAIL_CLIENT_SECRET,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Gmail OAuth failed (${response.status}): ${details}`);
  }

  const data = await response.json();
  return data.access_token;
};

const encodeBase64Url = (value) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const sendWithGmailApi = async ({ to, subject, html, text }) => {
  const accessToken = await getGmailAccessToken();
  const body = [
    `From: Class Attendance Portal <${emailUser}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    html || text || "",
  ].join("\r\n");

  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encodeBase64Url(body) }),
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Gmail API email failed (${response.status}): ${details}`);
  }
};

const sendMail = async (mailOptions) => {
  if (emailProvider === "gmail-api") {
    return sendWithGmailApi(mailOptions);
  }

  if (emailProvider === "resend") {
    return sendWithResend(mailOptions);
  }

  return (await getTransporter()).sendMail({
    from: `"Class Attendance Portal" <${emailUser}>`,
    ...mailOptions,
  });
};

const verifyEmailConfig = async () => {
  if (emailProvider === "gmail-api") {
    const required = [
      "GMAIL_CLIENT_ID",
      "GMAIL_CLIENT_SECRET",
      "GMAIL_REFRESH_TOKEN",
      "EMAIL_USER",
    ];
    const missing = required.filter((name) => !process.env[name]);

    if (missing.length) {
      throw new Error(`Missing Gmail API variables: ${missing.join(", ")}`);
    }

    await getGmailAccessToken();
    console.log("Gmail API email service is ready");
    return;
  }

  if (emailProvider === "resend") {
    if (!process.env.RESEND_API_KEY || !emailFrom) {
      throw new Error("RESEND_API_KEY and EMAIL_FROM are required for Resend");
    }

    console.log("Resend email service is configured");
    return;
  }

  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER and EMAIL_PASS are required for email delivery");
  }

  await (await getTransporter()).verify();
  console.log("Email service is ready");
};

module.exports = { sendMail, verifyEmailConfig };