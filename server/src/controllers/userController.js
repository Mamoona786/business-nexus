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

  walletBalance: user.walletBalance || 0,
  notificationPreferences: user.notificationPreferences || {
    email: true,
    inApp: true,
    messages: true,
    meetings: true,
    documents: true,
    payments: true,
    collaborations: true
  },
  privacySettings: user.privacySettings || {
    profileVisibility: 'public',
    showEmail: false,
    showOnlineStatus: true
  },
  twoFactorEnabled: user.twoFactorEnabled || false,

  createdAt: user.createdAt
});

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      users: users.map(formatUser)
    });
  } catch (error) {
    next(error);
  }
};

export const getInvestors = async (req, res, next) => {
  try {
    const { search = '', stage = '', interest = '' } = req.query;

    const filter = { role: 'investor' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { investmentInterests: { $regex: search, $options: 'i' } },
        { investmentStage: { $regex: search, $options: 'i' } }
      ];
    }

    if (stage) {
      const stageArray = stage.split(',').map((item) => item.trim()).filter(Boolean);
      if (stageArray.length) {
        filter.investmentStage = { $in: stageArray };
      }
    }

    if (interest) {
      const interestArray = interest.split(',').map((item) => item.trim()).filter(Boolean);
      if (interestArray.length) {
        filter.investmentInterests = { $in: interestArray };
      }
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      users: users.map(formatUser)
    });
  } catch (error) {
    next(error);
  }
};

export const getEntrepreneurs = async (req, res, next) => {
  try {
    const { search = '', industry = '' } = req.query;

    const filter = { role: 'entrepreneur' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { startupName: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { pitchSummary: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (industry) {
      const industryArray = industry.split(',').map((item) => item.trim()).filter(Boolean);
      if (industryArray.length) {
        filter.industry = { $in: industryArray };
      }
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      users: users.map(formatUser)
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      user: formatUser(user)
    });
  } catch (error) {
    next(error);
  }
};
