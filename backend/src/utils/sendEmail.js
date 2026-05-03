const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Use explicit host + port 587 (STARTTLS) instead of port 465 (SSL)
  // Render free tier blocks outbound IPv6 — force family:4 to use IPv4
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,       // STARTTLS (upgraded after connection)
    family: 4,           // Force IPv4 — Render blocks IPv6 outbound
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certs if any
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);
  console.log("Email sent: %s", info.messageId);
};

const generateEmailTemplate = (title, messageBody, codeOrToken) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #dad7cd; padding: 40px 20px; border-radius: 12px;">
      <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 15px rgba(52, 78, 65, 0.1); text-align: center;">
          <h1 style="color: #3a5a40; margin-top: 0; font-size: 28px;">HD Resorts</h1>
          <h2 style="color: #588157; font-size: 20px; margin-bottom: 20px;">${title}</h2>
          <p style="color: #344e41; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
              ${messageBody}
          </p>
          <div style="background-color: #f8fdf8; border: 2px dashed #a3b18a; padding: 20px; border-radius: 12px; margin: 20px 0; word-break: break-all;">
              <h2 style="color: #344e41; font-size: 32px; letter-spacing: 2px; margin: 0;">${codeOrToken}</h2>
          </div>
          <p style="color: #588157; font-size: 14px; margin-top: 30px;">
              This code will expire in 10 minutes.
          </p>
      </div>
      <p style="text-align: center; color: #588157; font-size: 12px; margin-top: 20px;">
          © 2026 HD Resorts. All rights reserved.
      </p>
    </div>
  `;
};

const sendVerificationEmail = async (email, otp) => {
  await sendEmail({
    email,
    subject: "HD Resorts - Email Verification",
    message: `Welcome to HD Resorts!\n\nYour 6-digit verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
    html: generateEmailTemplate("Email Verification", "Welcome to HD Resorts! Please use the following 6-digit verification code to securely activate your account:", otp),
  });
};

const sendLoginVerificationEmail = async (email, otp) => {
  await sendEmail({
    email,
    subject: "HD Resorts - Verify Your Login",
    message: `You tried to log in but your email is not verified.\n\nYour new 6-digit verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
    html: generateEmailTemplate("Verify Your Login", "You tried to log in, but your email has not been verified yet. Please use the verification code below to secure your account:", otp),
  });
};

const sendResendVerificationEmail = async (email, otp) => {
  await sendEmail({
    email,
    subject: "HD Resorts - Resend Verification Code",
    message: `Here is your new 6-digit verification code: ${otp}\n\nThis code will expire in 10 minutes.`,
    html: generateEmailTemplate("Resend Verification Code", "As requested, here is your new 6-digit verification code to activate your account:", otp),
  });
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const message = `You are receiving this email because you (or someone else) has requested a password reset for your account.\n\nYour secure recovery token is:\n\n${resetToken}\n\nPlease copy and paste this token into the app to reset your password. This token will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;
  await sendEmail({
    email,
    subject: "HD Resorts - Password Reset Token",
    message,
    html: generateEmailTemplate("Password Reset", "You are receiving this email because you (or someone else) has requested a password reset for your account. Please copy and paste the secure recovery token below into the app to reset your password.", resetToken),
  });
};

module.exports = { 
  sendEmail, 
  generateEmailTemplate,
  sendVerificationEmail,
  sendLoginVerificationEmail,
  sendResendVerificationEmail,
  sendPasswordResetEmail
};
