import SupportMessage from '../models/SupportMessage.js';
import sendEmail from '../utils/sendEmail.js';

export const createSupportMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    const supportMessage = await SupportMessage.create({
      user: req.user?._id || null,
      name,
      email: email.toLowerCase(),
      subject: subject || 'Support Request',
      message
    });

    const adminEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;

    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `Business Nexus Support: ${supportMessage.subject}`,
        text: `
Name: ${supportMessage.name}
Email: ${supportMessage.email}
Subject: ${supportMessage.subject}

Message:
${supportMessage.message}
        `,
        html: `
          <h2>New Support Request</h2>
          <p><strong>Name:</strong> ${supportMessage.name}</p>
          <p><strong>Email:</strong> ${supportMessage.email}</p>
          <p><strong>Subject:</strong> ${supportMessage.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${supportMessage.message}</p>
        `
      });
    }

    res.status(201).json({
      message: 'Support message submitted successfully',
      supportMessage: {
        id: supportMessage._id.toString(),
        name: supportMessage.name,
        email: supportMessage.email,
        subject: supportMessage.subject,
        status: supportMessage.status,
        createdAt: supportMessage.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMySupportMessages = async (req, res, next) => {
  try {
    const messages = await SupportMessage.find({ user: req.user._id }).sort({
      createdAt: -1
    });

    res.status(200).json({
      messages: messages.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        email: item.email,
        subject: item.subject,
        message: item.message,
        status: item.status,
        createdAt: item.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};
