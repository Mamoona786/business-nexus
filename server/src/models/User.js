import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const contactInfoSchema = new mongoose.Schema(
  {
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
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
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['entrepreneur', 'investor'],
      required: [true, 'Role is required']
    },

    avatarUrl: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    preferences: {
      type: [String],
      default: []
    },
    experience: {
      type: String,
      default: ''
    },
    interests: {
      type: [String],
      default: []
    },
    contactInfo: {
      type: contactInfoSchema,
      default: () => ({})
    },

    // Entrepreneur fields
    startupName: {
      type: String,
      default: ''
    },
    pitchSummary: {
      type: String,
      default: ''
    },
    fundingNeeded: {
      type: String,
      default: ''
    },
    industry: {
      type: String,
      default: ''
    },
    foundedYear: {
      type: Number,
      default: null
    },
    teamSize: {
      type: Number,
      default: 1
    },
    startupHistory: {
      type: String,
      default: ''
    },

    // Investor fields
    investmentInterests: {
      type: [String],
      default: []
    },
    investmentStage: {
      type: [String],
      default: []
    },
    portfolioCompanies: {
      type: [String],
      default: []
    },
    totalInvestments: {
      type: Number,
      default: 0
    },
    minimumInvestment: {
      type: String,
      default: ''
    },
    maximumInvestment: {
      type: String,
      default: ''
    },
    investmentHistory: {
      type: String,
      default: ''
    },

    resetPasswordToken: {
      type: String,
      select: false
    },
    resetPasswordExpire: {
      type: Date,
      select: false
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

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
