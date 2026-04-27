import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const contactInfoSchema = new mongoose.Schema(
  {
    phone: { type: String, default: '', trim: true },
    website: { type: String, default: '', trim: true },
    linkedin: { type: String, default: '', trim: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['entrepreneur', 'investor'],
      required: [true, 'Role is required']
    },

    avatarUrl: { type: String, default: '', trim: true },
    bio: { type: String, default: '', trim: true, maxlength: 1000 },
    location: { type: String, default: '', trim: true },
    preferences: { type: [String], default: [] },
    experience: { type: String, default: '', trim: true },
    interests: { type: [String], default: [] },
    contactInfo: {
      type: contactInfoSchema,
      default: () => ({})
    },

    startupName: { type: String, default: '', trim: true },
    pitchSummary: { type: String, default: '', trim: true },
    fundingNeeded: { type: String, default: '', trim: true },
    industry: { type: String, default: '', trim: true },
    foundedYear: { type: Number, default: null },
    teamSize: { type: Number, default: 1 },
    startupHistory: { type: String, default: '', trim: true },

    investmentInterests: { type: [String], default: [] },
    investmentStage: { type: [String], default: [] },
    portfolioCompanies: { type: [String], default: [] },
    totalInvestments: { type: Number, default: 0 },
    minimumInvestment: { type: String, default: '', trim: true },
    maximumInvestment: { type: String, default: '', trim: true },
    investmentHistory: { type: String, default: '', trim: true },

    walletBalance: {
      type: Number,
      default: 0
    },

        notificationPreferences: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      meetings: { type: Boolean, default: true },
      documents: { type: Boolean, default: true },
      payments: { type: Boolean, default: true },
      collaborations: { type: Boolean, default: true }
    },

    privacySettings: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
      },
      showEmail: { type: Boolean, default: false },
      showOnlineStatus: { type: Boolean, default: true }
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false
    },

    resetPasswordToken: {
      type: String,
      select: false
    },
    resetPasswordExpire: {
      type: Date,
      select: false
    },

    twoFactorOtp: {
      type: String,
      select: false
    },
    twoFactorOtpExpire: {
      type: Date,
      select: false
    },
    twoFactorOtpVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
