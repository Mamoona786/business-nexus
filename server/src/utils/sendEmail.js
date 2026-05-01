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
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  });

  try {
    await transporter.sendMail({
      from: `"Business Nexus" <${process.env.EMAIL_USER}>`,
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
