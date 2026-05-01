import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { generateResetToken, hashToken } from '../utils/tokenHelpers.js';

const formatUserResponse = (user) => ({
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

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const setTokenCookie = (res, token) => {
  res.cookie('token', token, cookieOptions);
};

const clearTokenCookie = (res) => {
  res.cookie('token', '', {
    ...cookieOptions,
    maxAge: 0,
    expires: new Date(0)
  });
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role
    });

    const token = generateToken(user._id, user.role);
    setTokenCookie(res, token);

    res.status(201).json({
      user: formatUserResponse(user),
      token
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    if (user.role !== role) {
      res.status(401);
      throw new Error('Selected role does not match this account');
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const token = generateToken(user._id, user.role);
    setTokenCookie(res, token);

    res.status(200).json({
      user: formatUserResponse(user),
      token
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    clearTokenCookie(res);

    res.status(200).json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      user: formatUserResponse(req.user)
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+resetPasswordToken +resetPasswordExpire'
    );

    if (!user) {
      res.status(404);
      throw new Error('No account found with that email');
    }

    const resetToken = generateResetToken();
    const hashedResetToken = hashToken(resetToken);

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const text = `You requested a password reset. Please use this link: ${resetUrl}. This link expires in 10 minutes.`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Reset your Business Nexus password</h2>
        <p>Click the link below to set a new password:</p>
        <p><a href="${resetUrl}" target="_blank">${resetUrl}</a></p>
        <p>This link expires in 10 minutes.</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Business Nexus Password Reset',
      text,
      html
    });

    res.status(200).json({
      message: 'Password reset instructions have been sent to your email'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
      res.status(400);
      throw new Error('Reset link is invalid or has expired');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    next(error);
  }
};
