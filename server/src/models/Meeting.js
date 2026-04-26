import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
      maxlength: 120
    },
    createdBy: {
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
    startDateTime: {
      type: Date,
      required: true
    },
    endDateTime: {
      type: Date,
      required: true
    },
    meetingType: {
      type: String,
      enum: ['video', 'audio', 'in_person'],
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
    }
  },
  { timestamps: true }
);

meetingSchema.index({ participants: 1, startDateTime: 1, endDateTime: 1 });

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
