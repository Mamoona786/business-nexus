import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000
  });

  try {
    await transporter.sendMail({
      from: `"Business Nexus" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text,
      html
    });

    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw new Error('Failed to send email. Please try again later.');
  }
};

export default sendEmail;
