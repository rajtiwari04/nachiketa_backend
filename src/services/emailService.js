const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const baseTemplate = (content) => `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:-apple-system,sans-serif;background:#f8f7f4;margin:0}.container{max-width:560px;margin:40px auto;background:#fff;border-radius:16px;padding:40px;box-shadow:0 2px 16px rgba(0,0,0,.08)}.logo{font-size:22px;font-weight:700;color:#1a1a2e;margin-bottom:32px}.logo span{color:#6366f1}h1{font-size:24px;font-weight:700;color:#1a1a2e;margin:0 0 12px}p{color:#6b7280;line-height:1.6;margin:0 0 16px}.btn{display:inline-block;background:#6366f1;color:#fff!important;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;margin:16px 0}.footer{margin-top:32px;padding-top:24px;border-top:1px solid #f0f0f0;color:#9ca3af;font-size:13px}</style></head><body><div class="container"><div class="logo">Nach<span>iketa</span></div>${content}<div class="footer"><p>© 2025 Nachiketa Society</p></div></div></body></html>`;

exports.sendVerificationEmail = async (email, name, url) => {
  await transporter.sendMail({
    from: `"Nachiketa Society" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Verify your email — Nachiketa',
    html: baseTemplate(`<h1>Welcome, ${name}!</h1><p>Please verify your email address to get started with Nachiketa Society.</p><a href="${url}" class="btn">Verify Email</a><p>This link expires in 24 hours.</p>`),
  });
};

exports.sendPasswordResetEmail = async (email, name, url) => {
  await transporter.sendMail({
    from: `"Nachiketa Society" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Reset your password — Nachiketa',
    html: baseTemplate(`<h1>Reset your password</h1><p>Hi ${name}, click below to reset your password.</p><a href="${url}" class="btn">Reset Password</a><p>This link expires in 1 hour.</p>`),
  });
};
