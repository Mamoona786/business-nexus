import Notification from '../models/Notification.js';

export const createNotification = async ({
  req,
  recipient,
  sender = null,
  type,
  title,
  message,
  link = '',
  entityId = null,
  entityType = ''
}) => {
  const notification = await Notification.create({
    recipient,
    sender,
    type,
    title,
    message,
    link,
    entityId,
    entityType
  });

  const populatedNotification = await Notification.findById(notification._id)
    .populate('sender', 'name email role avatarUrl');

  const io = req?.app?.get('io');

  if (io) {
    io.to(`user:${recipient.toString()}`).emit('notification:new', {
      notification: formatNotification(populatedNotification)
    });
  }

  return populatedNotification;
};

export const formatNotification = (notification) => ({
  id: notification._id.toString(),
  recipient: notification.recipient?.toString?.() || notification.recipient,
  sender: notification.sender?._id
    ? {
        id: notification.sender._id.toString(),
        name: notification.sender.name,
        email: notification.sender.email,
        role: notification.sender.role,
        avatarUrl: notification.sender.avatarUrl || ''
      }
    : null,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  link: notification.link,
  entityId: notification.entityId?.toString?.() || notification.entityId || null,
  entityType: notification.entityType,
  isRead: notification.isRead,
  readAt: notification.readAt,
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt
});
