import nodemailer from "nodemailer";
import { appUrl } from "./auth";

function transport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

export async function sendMail(to: string, subject: string, html: string, text: string) {
  const tx = transport();
  if (!tx) {
    console.info(`[email:dev] to=${to} subject=${subject}\n${text}`);
    return;
  }
  await tx.sendMail({
    from: process.env.SMTP_FROM || "NoteScript <noreply@localhost>",
    to,
    subject,
    html,
    text,
  });
}

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${appUrl()}/verify-email?token=${token}`;
  await sendMail(
    to,
    "Verify your NoteScript email",
    `<p>Welcome to NoteScript.</p><p><a href="${link}">Verify your email</a></p>`,
    `Verify your email: ${link}`,
  );
}

export async function sendResetEmail(to: string, token: string) {
  const link = `${appUrl()}/reset-password?token=${token}`;
  await sendMail(
    to,
    "Reset your NoteScript password",
    `<p>Reset your password:</p><p><a href="${link}">Choose a new password</a></p><p>This link expires in 1 hour.</p>`,
    `Reset your password: ${link}`,
  );
}
