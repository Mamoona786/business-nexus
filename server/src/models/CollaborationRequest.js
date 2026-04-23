import mongoose from 'mongoose';

const collaborationRequestSchema = new mongoose.Schema(
  {
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    entrepreneurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'in_progress', 'closed'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

collaborationRequestSchema.index(
  { investorId: 1, entrepreneurId: 1 },
  { unique: true }
);

const CollaborationRequest = mongoose.model(
  'CollaborationRequest',
  collaborationRequestSchema
);

export default CollaborationRequest;
