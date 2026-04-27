import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html, text }) => {
  const hasEmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (!hasEmailConfig) {
    console.log('Email credentials not configured. Email skipped.');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Text:', text);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Business Nexus" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  });
};

export default sendEmail;
