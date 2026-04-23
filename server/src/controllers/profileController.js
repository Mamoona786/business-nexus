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

export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      user: formatUser(user)
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const commonFields = [
      'name',
      'bio',
      'avatarUrl',
      'location',
      'experience'
    ];

    commonFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    if (Array.isArray(req.body.preferences)) {
      user.preferences = req.body.preferences;
    }

    if (Array.isArray(req.body.interests)) {
      user.interests = req.body.interests;
    }

    if (req.body.contactInfo) {
      user.contactInfo = {
        phone: req.body.contactInfo.phone || '',
        website: req.body.contactInfo.website || '',
        linkedin: req.body.contactInfo.linkedin || ''
      };
    }

    if (user.role === 'entrepreneur') {
      const entrepreneurFields = [
        'startupName',
        'pitchSummary',
        'fundingNeeded',
        'industry',
        'startupHistory'
      ];

      entrepreneurFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          user[field] = req.body[field];
        }
      });

      if (req.body.foundedYear !== undefined) {
        user.foundedYear = req.body.foundedYear || null;
      }

      if (req.body.teamSize !== undefined) {
        user.teamSize = req.body.teamSize || 1;
      }
    }

    if (user.role === 'investor') {
      const investorFields = [
        'minimumInvestment',
        'maximumInvestment',
        'investmentHistory'
      ];

      investorFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          user[field] = req.body[field];
        }
      });

      if (Array.isArray(req.body.investmentInterests)) {
        user.investmentInterests = req.body.investmentInterests;
      }

      if (Array.isArray(req.body.investmentStage)) {
        user.investmentStage = req.body.investmentStage;
      }

      if (Array.isArray(req.body.portfolioCompanies)) {
        user.portfolioCompanies = req.body.portfolioCompanies;
      }

      if (req.body.totalInvestments !== undefined) {
        user.totalInvestments = req.body.totalInvestments || 0;
      }
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: formatUser(updatedUser)
    });
  } catch (error) {
    next(error);
  }
};
