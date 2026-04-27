import SupportMessage from '../models/SupportMessage.js';
import { createNotification } from '../utils/notificationHelper.js';

export const createSupportMessage = async (req, res, next) => {
  try {
    const { name, email, subject = 'Support Request', message } = req.body;

    if (!name || !email || !message) {
      res.status(400);
      throw new Error('Name, email and message are required');
    }

    const supportMessage = await SupportMessage.create({
      user: req.user?._id || null,
      name,
      email,
      subject,
      message
    });

    if (req.user?._id) {
      await createNotification({
        req,
        recipient: req.user._id,
        sender: req.user._id,
        type: 'support',
        title: 'Support request submitted',
        message: 'Your support request has been received successfully.',
        link: '/help',
        entityId: supportMessage._id,
        entityType: 'SupportMessage'
      });
    }

    res.status(201).json({
      message: 'Support message submitted successfully',
      supportMessage
    });
  } catch (error) {
    next(error);
  }
};
