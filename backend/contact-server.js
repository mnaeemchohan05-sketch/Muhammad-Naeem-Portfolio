import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import nodemailer from 'nodemailer';

const app = express();

const PORT = Number(process.env.PORT || 8080);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const TO_EMAIL = process.env.TO_EMAIL;
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !TO_EMAIL) {
  console.error(
    'Missing required env vars. Set SMTP_HOST, SMTP_USER, SMTP_PASS, TO_EMAIL before starting backend.'
  );
  process.exit(1);
}

app.use(cors({ origin: ALLOWED_ORIGIN === '*' ? true : ALLOWED_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/contact', async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim();
  const message = String(req.body?.message || '').trim();
  const sentAt = String(req.body?.sent_at || new Date().toISOString());

  // Basic backend validation so malformed requests do not send emails.
  if (!name || name.length < 2) {
    return res.status(400).json({ success: false, error: 'Invalid name' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email' });
  }
  if (!message || message.length < 10) {
    return res.status(400).json({ success: false, error: 'Message too short' });
  }

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `Portfolio Contact: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nSent At: ${sentAt}\n\nMessage:\n${message}`,
      html: `
        <h3>Portfolio Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Sent At:</strong> ${sentAt}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    });
    return res.json({ success: true });
  } catch (error) {
    console.error('Send mail error:', error);
    return res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

app.listen(PORT, () => {
  console.log(`Contact backend running on port ${PORT}`);
});
