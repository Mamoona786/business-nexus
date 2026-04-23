import crypto from 'crypto';
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
  createdAt: user.createdAt
});

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400);
      throw new Error('Please provide name, email, password and role');
    }

    if (!['entrepreneur', 'investor'].includes(role)) {
      res.status(400);
      throw new Error('Invalid role selected');
    }

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

    const token = generateToken(user._id);
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

    if (!email || !password || !role) {
      res.status(400);
      throw new Error('Please provide email, password and role');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

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

    const token = generateToken(user._id);
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
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    });

    res.status(200).json({ message: 'Logged out successfully' });
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

    if (!email) {
      res.status(400);
      throw new Error('Email is required');
    }

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

    const text = `You requested a password reset. Please use the following link: ${resetUrl}. This link expires in 10 minutes.`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Reset your Business Nexus password</h2>
        <p>You requested a password reset.</p>
        <p>
          Click the link below to set a new password:
        </p>
        <p>
          <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        </p>
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

    if (!token) {
      res.status(400);
      throw new Error('Reset token is required');
    }

    if (!password || password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }

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
