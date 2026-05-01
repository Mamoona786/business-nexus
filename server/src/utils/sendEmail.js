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
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000
  });

  try {
    await transporter.verify();
    console.log('SMTP server is ready');

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
