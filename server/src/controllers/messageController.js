import mongoose from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';

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
  senderId:
    typeof message.sender === 'object' && message.sender?._id
      ? message.sender._id.toString()
      : message.sender.toString(),
  receiverId:
    typeof message.receiver === 'object' && message.receiver?._id
      ? message.receiver._id.toString()
      : message.receiver.toString(),
  content: message.content,
  isRead: message.isRead,
  readAt: message.readAt,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt
});

export const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content?.trim()) {
      res.status(400);
      throw new Error('Receiver and message content are required');
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      res.status(400);
      throw new Error('Invalid receiver id');
    }

    if (senderId.toString() === receiverId) {
      res.status(400);
      throw new Error('You cannot send a message to yourself');
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      res.status(404);
      throw new Error('Receiver not found');
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content.trim()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email role avatarUrl')
      .populate('receiver', 'name email role avatarUrl');

    const formattedMessage = formatMessage(populatedMessage);

    const io = req.app.get('io');

    if (io) {
      io.to(`user:${senderId.toString()}`).emit('message:new', formattedMessage);
      io.to(`user:${receiverId}`).emit('message:new', formattedMessage);
    }

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

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email role avatarUrl')
      .populate('receiver', 'name email role avatarUrl');

    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: currentUserId,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    const refreshedMessages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email role avatarUrl')
      .populate('receiver', 'name email role avatarUrl');

    const io = req.app.get('io');

    if (io) {
      io.to(`user:${otherUserId}`).emit('messages:read', {
        byUserId: currentUserId,
        conversationWithUserId: otherUserId
      });
    }

    res.status(200).json({
      chatPartner: formatUser(otherUser),
      messages: refreshedMessages.map(formatMessage)
    });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(currentUserId) },
            { receiver: new mongoose.Types.ObjectId(currentUserId) }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          otherParticipant: {
            $cond: [
              { $eq: ['$sender', new mongoose.Types.ObjectId(currentUserId)] },
              '$receiver',
              '$sender'
            ]
          }
        }
      },
      {
        $group: {
          _id: '$otherParticipant',
          lastMessageId: { $first: '$_id' },
          lastMessageContent: { $first: '$content' },
          lastMessageCreatedAt: { $first: '$createdAt' },
          lastMessageSender: { $first: '$sender' },
          lastMessageReceiver: { $first: '$receiver' },
          lastMessageIsRead: { $first: '$isRead' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', new mongoose.Types.ObjectId(currentUserId)] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'participant'
        }
      },
      {
        $unwind: '$participant'
      },
      {
        $project: {
          _id: 0,
          id: { $toString: '$lastMessageId' },
          participant: '$participant',
          unreadCount: 1,
          lastMessage: {
            id: { $toString: '$lastMessageId' },
            senderId: { $toString: '$lastMessageSender' },
            receiverId: { $toString: '$lastMessageReceiver' },
            content: '$lastMessageContent',
            isRead: '$lastMessageIsRead',
            createdAt: '$lastMessageCreatedAt'
          }
        }
      },
      {
        $sort: {
          'lastMessage.createdAt': -1
        }
      }
    ]);

    const onlineUsers = req.app.get('onlineUsers') || new Map();

    const formattedConversations = conversations.map((conversation) => {
      const participant = conversation.participant;

      return {
        id: conversation.id,
        participants: [currentUserId, participant._id.toString()],
        participant: {
          ...formatUser(participant),
          isOnline: onlineUsers.has(participant._id.toString())
        },
        lastMessage: conversation.lastMessage,
        unreadCount: conversation.unreadCount
      };
    });

    res.status(200).json({
      conversations: formattedConversations
    });
  } catch (error) {
    next(error);
  }
};
