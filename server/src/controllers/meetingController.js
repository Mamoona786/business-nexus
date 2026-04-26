import mongoose from 'mongoose';
import Meeting from '../models/Meeting.js';
import User from '../models/User.js';

const buildDateTime = (date, time) => new Date(`${date}T${time}:00`);

const formatMeeting = (meeting) => ({
  id: meeting._id.toString(),
  title: meeting.title,
  createdBy: meeting.createdBy,
  participants: meeting.participants,
  date: meeting.date,
  startTime: meeting.startTime,
  endTime: meeting.endTime,
  startDateTime: meeting.startDateTime,
  endDateTime: meeting.endDateTime,
  meetingType: meeting.meetingType,
  status: meeting.status,
  notes: meeting.notes,
  meetingLink: meeting.meetingLink,
  roomId: meeting.roomId,
  createdAt: meeting.createdAt,
  updatedAt: meeting.updatedAt
});

const hasConflict = async ({ participantIds, startDateTime, endDateTime, excludeMeetingId }) => {
  const query = {
    participants: { $in: participantIds },
    status: { $in: ['pending', 'accepted', 'rescheduled'] },
    startDateTime: { $lt: endDateTime },
    endDateTime: { $gt: startDateTime }
  };

  if (excludeMeetingId) {
    query._id = { $ne: excludeMeetingId };
  }

  return Meeting.findOne(query);
};

export const scheduleMeeting = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();

    const {
      title,
      participantIds,
      date,
      startTime,
      endTime,
      meetingType = 'video',
      notes = ''
    } = req.body;

    if (!title || !date || !startTime || !endTime || !participantIds?.length) {
      res.status(400);
      throw new Error('Title, participants, date, start time and end time are required');
    }

    const cleanParticipantIds = [...new Set(participantIds.map(String))];

    for (const id of cleanParticipantIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid participant id');
      }
    }

    if (cleanParticipantIds.includes(currentUserId)) {
      res.status(400);
      throw new Error('You cannot add yourself as participant');
    }

    const users = await User.find({ _id: { $in: cleanParticipantIds } });

    if (users.length !== cleanParticipantIds.length) {
      res.status(404);
      throw new Error('One or more participants not found');
    }

    const startDateTime = buildDateTime(date, startTime);
    const endDateTime = buildDateTime(date, endTime);

    if (Number.isNaN(startDateTime.getTime()) || Number.isNaN(endDateTime.getTime())) {
      res.status(400);
      throw new Error('Invalid meeting date or time');
    }

    if (endDateTime <= startDateTime) {
      res.status(400);
      throw new Error('End time must be after start time');
    }

    const allParticipants = [currentUserId, ...cleanParticipantIds];

    const conflict = await hasConflict({
      participantIds: allParticipants,
      startDateTime,
      endDateTime
    });

    if (conflict) {
      res.status(409);
      throw new Error('Meeting conflict detected for selected time');
    }

    const roomId = new mongoose.Types.ObjectId().toString();
    const meetingLink = meetingType === 'video' ? `/video-call/${roomId}` : '';

    const meeting = await Meeting.create({
      title,
      createdBy: currentUserId,
      participants: allParticipants,
      date,
      startTime,
      endTime,
      startDateTime,
      endDateTime,
      meetingType,
      notes,
      roomId,
      meetingLink,
      status: 'pending'
    });

    const io = req.app.get('io');

    if (io) {
      allParticipants.forEach((id) => {
        io.to(`user:${id}`).emit('meeting:updated', formatMeeting(meeting));
      });
    }

    res.status(201).json({
      message: 'Meeting scheduled successfully',
      meeting: formatMeeting(meeting)
    });
  } catch (error) {
    next(error);
  }
};

export const getMyMeetings = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();

    const meetings = await Meeting.find({
      participants: currentUserId
    })
      .populate('createdBy', 'name email role avatarUrl')
      .populate('participants', 'name email role avatarUrl')
      .sort({ startDateTime: 1 });

    res.status(200).json({
      meetings: meetings.map(formatMeeting)
    });
  } catch (error) {
    next(error);
  }
};

export const acceptMeeting = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();
    const { meetingId } = req.params;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      res.status(404);
      throw new Error('Meeting not found');
    }

    if (!meeting.participants.some((id) => id.toString() === currentUserId)) {
      res.status(403);
      throw new Error('You are not part of this meeting');
    }

    const conflict = await hasConflict({
      participantIds: [currentUserId],
      startDateTime: meeting.startDateTime,
      endDateTime: meeting.endDateTime,
      excludeMeetingId: meeting._id
    });

    if (conflict) {
      res.status(409);
      throw new Error('You already have another meeting at this time');
    }

    meeting.status = 'accepted';
    await meeting.save();

    const io = req.app.get('io');

    if (io) {
      meeting.participants.forEach((id) => {
        io.to(`user:${id}`).emit('meeting:updated', formatMeeting(meeting));
      });
    }

    res.status(200).json({
      message: 'Meeting accepted',
      meeting: formatMeeting(meeting)
    });
  } catch (error) {
    next(error);
  }
};

export const rejectMeeting = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();
    const { meetingId } = req.params;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      res.status(404);
      throw new Error('Meeting not found');
    }

    if (!meeting.participants.some((id) => id.toString() === currentUserId)) {
      res.status(403);
      throw new Error('You are not part of this meeting');
    }

    meeting.status = 'rejected';
    await meeting.save();

    const io = req.app.get('io');

    if (io) {
      meeting.participants.forEach((id) => {
        io.to(`user:${id}`).emit('meeting:updated', formatMeeting(meeting));
      });
    }

    res.status(200).json({
      message: 'Meeting rejected',
      meeting: formatMeeting(meeting)
    });
  } catch (error) {
    next(error);
  }
};

export const cancelMeeting = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();
    const { meetingId } = req.params;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      res.status(404);
      throw new Error('Meeting not found');
    }

    if (meeting.createdBy.toString() !== currentUserId) {
      res.status(403);
      throw new Error('Only meeting creator can cancel this meeting');
    }

    meeting.status = 'cancelled';
    await meeting.save();

    const io = req.app.get('io');

    if (io) {
      meeting.participants.forEach((id) => {
        io.to(`user:${id}`).emit('meeting:updated', formatMeeting(meeting));
      });
    }

    res.status(200).json({
      message: 'Meeting cancelled',
      meeting: formatMeeting(meeting)
    });
  } catch (error) {
    next(error);
  }
};

export const rescheduleMeeting = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();
    const { meetingId } = req.params;
    const { date, startTime, endTime, notes } = req.body;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      res.status(404);
      throw new Error('Meeting not found');
    }

    if (meeting.createdBy.toString() !== currentUserId) {
      res.status(403);
      throw new Error('Only meeting creator can reschedule this meeting');
    }

    const newDate = date || meeting.date;
    const newStartTime = startTime || meeting.startTime;
    const newEndTime = endTime || meeting.endTime;

    const startDateTime = buildDateTime(newDate, newStartTime);
    const endDateTime = buildDateTime(newDate, newEndTime);

    if (endDateTime <= startDateTime) {
      res.status(400);
      throw new Error('End time must be after start time');
    }

    const conflict = await hasConflict({
      participantIds: meeting.participants,
      startDateTime,
      endDateTime,
      excludeMeetingId: meeting._id
    });

    if (conflict) {
      res.status(409);
      throw new Error('Meeting conflict detected for selected time');
    }

    meeting.date = newDate;
    meeting.startTime = newStartTime;
    meeting.endTime = newEndTime;
    meeting.startDateTime = startDateTime;
    meeting.endDateTime = endDateTime;
    meeting.status = 'rescheduled';

    if (typeof notes === 'string') {
      meeting.notes = notes;
    }

    await meeting.save();

    const io = req.app.get('io');

    if (io) {
      meeting.participants.forEach((id) => {
        io.to(`user:${id}`).emit('meeting:updated', formatMeeting(meeting));
      });
    }

    res.status(200).json({
      message: 'Meeting rescheduled',
      meeting: formatMeeting(meeting)
    });
  } catch (error) {
    next(error);
  }
};
