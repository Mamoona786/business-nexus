import Notification from '../models/Notification.js';
import { formatNotification } from '../utils/notificationHelper.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const { unreadOnly = 'false' } = req.query;

    const filter = {
      recipient: req.user._id
    };

    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate('sender', 'name email role avatarUrl')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      notifications: notifications.map(formatNotification)
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadNotificationCount = async (req, res, next) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    }).populate('sender', 'name email role avatarUrl');

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      message: 'Notification marked as read',
      notification: formatNotification(notification)
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.status(200).json({
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    await notification.deleteOne();

    res.status(200).json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
