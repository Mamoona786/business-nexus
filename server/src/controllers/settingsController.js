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
  notificationPreferences: user.notificationPreferences,
  privacySettings: user.privacySettings,
  twoFactorEnabled: user.twoFactorEnabled,
  createdAt: user.createdAt
});

export const getSettings = async (req, res, next) => {
  try {
    res.status(200).json({
      settings: {
        notificationPreferences: req.user.notificationPreferences,
        privacySettings: req.user.privacySettings,
        twoFactorEnabled: req.user.twoFactorEnabled
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateAccountSettings = async (req, res, next) => {
  try {
    const { name, email, location, bio } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });

      if (existingUser) {
        res.status(400);
        throw new Error('Email is already in use');
      }

      user.email = email.toLowerCase();
    }

    if (name !== undefined) user.name = name;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Account settings updated successfully',
      user: formatUser(updatedUser)
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      res.status(400);
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotificationPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const allowedFields = [
      'email',
      'inApp',
      'messages',
      'meetings',
      'documents',
      'payments',
      'collaborations'
    ];

    allowedFields.forEach((field) => {
      if (typeof req.body[field] === 'boolean') {
        user.notificationPreferences[field] = req.body[field];
      }
    });

    await user.save();

    res.status(200).json({
      message: 'Notification preferences updated successfully',
      notificationPreferences: user.notificationPreferences
    });
  } catch (error) {
    next(error);
  }
};

export const updatePrivacySettings = async (req, res, next) => {
  try {
    const { profileVisibility, showEmail, showOnlineStatus } = req.body;

    const user = await User.findById(req.user._id);

    if (profileVisibility !== undefined) {
      user.privacySettings.profileVisibility = profileVisibility;
    }

    if (typeof showEmail === 'boolean') {
      user.privacySettings.showEmail = showEmail;
    }

    if (typeof showOnlineStatus === 'boolean') {
      user.privacySettings.showOnlineStatus = showOnlineStatus;
    }

    await user.save();

    res.status(200).json({
      message: 'Privacy settings updated successfully',
      privacySettings: user.privacySettings
    });
  } catch (error) {
    next(error);
  }
};

export const toggleTwoFactor = async (req, res, next) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      res.status(400);
      throw new Error('Enabled value must be true or false');
    }

    const user = await User.findById(req.user._id);
    user.twoFactorEnabled = enabled;

    await user.save();

    res.status(200).json({
      message: enabled
        ? 'Two-factor authentication enabled'
        : 'Two-factor authentication disabled',
      twoFactorEnabled: user.twoFactorEnabled
    });
  } catch (error) {
    next(error);
  }
};
