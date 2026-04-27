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
  walletBalance: user.walletBalance || 0,
  notificationPreferences: user.notificationPreferences,
  privacySettings: user.privacySettings,
  twoFactorEnabled: user.twoFactorEnabled,
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

export const updateAccountSettings = async (req, res, next) => {
  try {
    const allowedFields = [
      'name',
      'email',
      'avatarUrl',
      'bio',
      'location',
      'preferences',
      'experience',
      'interests',
      'contactInfo'
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      message: 'Account settings updated successfully',
      user: formatUser(user)
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400);
      throw new Error('Current password, new password and confirm password are required');
    }

    if (newPassword !== confirmPassword) {
      res.status(400);
      throw new Error('New password and confirm password do not match');
    }

    if (newPassword.length < 8) {
      res.status(400);
      throw new Error('Password must be at least 8 characters');
    }

    const user = await User.findById(req.user._id).select('+password');

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

    user.notificationPreferences = {
      ...user.notificationPreferences?.toObject?.(),
      ...req.body
    };

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
    const allowedVisibility = ['public', 'private'];

    if (
      req.body.profileVisibility &&
      !allowedVisibility.includes(req.body.profileVisibility)
    ) {
      res.status(400);
      throw new Error('Invalid profile visibility value');
    }

    const user = await User.findById(req.user._id);

    user.privacySettings = {
      ...user.privacySettings?.toObject?.(),
      ...req.body
    };

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
      throw new Error('Enabled must be true or false');
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        twoFactorEnabled: enabled
      },
      {
        new: true
      }
    ).select('-password');

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
