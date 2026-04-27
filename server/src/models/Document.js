import mongoose from 'mongoose';

const documentVersionSchema = new mongoose.Schema(
  {
    version: Number,
    fileUrl: String,
    fileName: String,
    fileType: String,
    fileSize: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    fileUrl: {
      type: String,
      required: true
    },

    fileName: {
      type: String,
      required: true
    },

    fileType: {
      type: String,
      required: true
    },

    fileSize: {
      type: Number,
      required: true
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    relatedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],

    version: {
      type: Number,
      default: 1
    },

    versions: {
      type: [documentVersionSchema],
      default: []
    },

    status: {
      type: String,
      enum: ['draft', 'pending_review', 'approved', 'rejected', 'signed'],
      default: 'draft'
    },

    signatureUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Document = mongoose.model('Document', documentSchema);

export default Document;
