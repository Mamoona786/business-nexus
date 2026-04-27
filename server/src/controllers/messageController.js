import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notificationHelper.js';

const formatUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl || '',
  bio: user.bio || '',
  location: user.location || '',
  preferences: user.preferences || [],
  experience: user.experience || '',
  interests: user.interests || [],
  contactInfo: user.contactInfo || {
    phone: '',
    website: '',
    linkedin: ''
  },
  startupName: user.startupName || '',
  pitchSummary: user.pitchSummary || '',
  fundingNeeded: user.fundingNeeded || '',
  industry: user.industry || '',
  foundedYear: user.foundedYear || null,
  teamSize: user.teamSize || 1,
  startupHistory: user.startupHistory || '',
  investmentInterests: user.investmentInterests || [],
  investmentStage: user.investmentStage || [],
  portfolioCompanies: user.portfolioCompanies || [],
  totalInvestments: user.totalInvestments || 0,
  minimumInvestment: user.minimumInvestment || '',
  maximumInvestment: user.maximumInvestment || '',
  investmentHistory: user.investmentHistory || '',
  createdAt: user.createdAt
});

const formatMessage = (message) => ({
  id: message._id.toString(),
  senderId: message.sender.toString(),
  receiverId: message.receiver.toString(),
  content: message.content,
  isRead: message.isRead,
  readAt: message.readAt,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt
});

const getParticipantIds = (userA, userB) => [
  new mongoose.Types.ObjectId(userA),
  new mongoose.Types.ObjectId(userB)
];

export const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user._id.toString();
    const { receiverId, content } = req.body;

    if (!receiverId || !content?.trim()) {
      res.status(400);
      throw new Error('Receiver and message content are required');
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      res.status(400);
      throw new Error('Invalid receiver id');
    }

    if (senderId === receiverId) {
      res.status(400);
      throw new Error('You cannot send a message to yourself');
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      res.status(404);
      throw new Error('Receiver not found');
    }

    const messageData = {
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      isRead: false,
      readAt: null
    };

    let conversation = await Conversation.findOne({
      participants: {
        $all: getParticipantIds(senderId, receiverId),
        $size: 2
      }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: getParticipantIds(senderId, receiverId),
        messages: [messageData],
        lastMessage: {
          sender: senderId,
          receiver: receiverId,
          content: content.trim(),
          isRead: false,
          createdAt: new Date()
        }
      });
    } else {
      conversation.messages.push(messageData);
      conversation.lastMessage = {
        sender: senderId,
        receiver: receiverId,
        content: content.trim(),
        isRead: false,
        createdAt: new Date()
      };

      await conversation.save();
    }

    const newMessage = conversation.messages[conversation.messages.length - 1];
    const formattedMessage = formatMessage(newMessage);

    const io = req.app.get('io');

    if (io) {
      io.to(`user:${senderId}`).emit('message:new', formattedMessage);
      io.to(`user:${receiverId}`).emit('message:new', formattedMessage);
    }

    await createNotification({
      req,
      recipient: receiverId,
      sender: senderId,
      type: 'message',
      title: 'New message',
      message: `${req.user.name} sent you a message.`,
      link: `/chat/${senderId}`,
      entityId: conversation._id,
      entityType: 'Conversation'
    });

    res.status(201).json({
      message: formattedMessage
    });
  } catch (error) {
    next(error);
  }
};

export const getChatMessages = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();
    const otherUserId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      res.status(400);
      throw new Error('Invalid user id');
    }

    const otherUser = await User.findById(otherUserId);

    if (!otherUser) {
      res.status(404);
      throw new Error('Chat user not found');
    }

    const conversation = await Conversation.findOne({
      participants: {
        $all: getParticipantIds(currentUserId, otherUserId),
        $size: 2
      }
    });

    let readUpdated = false;

    if (conversation) {
      conversation.messages.forEach((message) => {
        if (
          message.sender.toString() === otherUserId &&
          message.receiver.toString() === currentUserId &&
          !message.isRead
        ) {
          message.isRead = true;
          message.readAt = new Date();
          readUpdated = true;
        }
      });

      if (
        conversation.lastMessage?.receiver?.toString() === currentUserId &&
        conversation.lastMessage?.sender?.toString() === otherUserId &&
        conversation.lastMessage?.isRead === false
      ) {
        conversation.lastMessage.isRead = true;
      }

      if (readUpdated) {
        await conversation.save();

        const io = req.app.get('io');

        if (io) {
          io.to(`user:${otherUserId}`).emit('messages:read', {
            byUserId: currentUserId,
            conversationWithUserId: otherUserId
          });
        }
      }
    }

    res.status(200).json({
      chatPartner: formatUser(otherUser),
      messages: conversation ? conversation.messages.map(formatMessage) : []
    });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();

    const conversations = await Conversation.find({
      participants: currentUserId
    })
      .populate(
        'participants',
        'name email role avatarUrl bio location preferences experience interests contactInfo startupName pitchSummary fundingNeeded industry foundedYear teamSize startupHistory investmentInterests investmentStage portfolioCompanies totalInvestments minimumInvestment maximumInvestment investmentHistory createdAt'
      )
      .sort({ updatedAt: -1 });

    const onlineUsers = req.app.get('onlineUsers') || new Map();

    const formattedConversations = conversations.map((conversation) => {
      const participant = conversation.participants.find(
        (user) => user._id.toString() !== currentUserId
      );

      const unreadCount = conversation.messages.filter(
        (message) =>
          message.receiver.toString() === currentUserId && !message.isRead
      ).length;

      return {
        id: conversation._id.toString(),
        participants: conversation.participants.map((user) => user._id.toString()),
        participant: {
          ...formatUser(participant),
          isOnline: onlineUsers.has(participant._id.toString())
        },
        lastMessage: conversation.lastMessage
          ? {
              id: conversation._id.toString(),
              senderId: conversation.lastMessage.sender?.toString(),
              receiverId: conversation.lastMessage.receiver?.toString(),
              content: conversation.lastMessage.content,
              isRead: conversation.lastMessage.isRead,
              createdAt: conversation.lastMessage.createdAt
            }
          : null,
        unreadCount
      };
    });

    res.status(200).json({
      conversations: formattedConversations
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadMessageCount = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();

    const conversations = await Conversation.find({
      participants: currentUserId
    });

    const unreadCount = conversations.reduce((total, conversation) => {
      const count = conversation.messages.filter(
        (message) =>
          message.receiver.toString() === currentUserId && !message.isRead
      ).length;

      return total + count;
    }, 0);

    res.status(200).json({
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};
