import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
      maxlength: 150
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    date: {
      type: String,
      required: [true, 'Meeting date is required']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required']
    },
    meetingType: {
      type: String,
      enum: ['video', 'audio', 'in_person', 'other'],
      default: 'video'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'rescheduled'],
      default: 'pending'
    },
    notes: {
      type: String,
      default: '',
      maxlength: 1000
    },
    meetingLink: {
      type: String,
      default: ''
    },
    roomId: {
      type: String,
      default: ''
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

meetingSchema.index({ organizer: 1, date: 1 });
meetingSchema.index({ participants: 1, date: 1 });

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
