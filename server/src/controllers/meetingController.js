import mongoose from 'mongoose';
import Meeting from '../models/Meeting.js';
import User from '../models/User.js';

const formatUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl || ''
});

const formatMeeting = (meeting) => ({
  id: meeting._id.toString(),
  title: meeting.title,
  organizer:
    typeof meeting.organizer === 'object' && meeting.organizer?._id
      ? formatUser(meeting.organizer)
      : meeting.organizer?.toString(),
  participants: Array.isArray(meeting.participants)
    ? meeting.participants.map((participant) =>
        typeof participant === 'object' && participant?._id
          ? formatUser(participant)
          : participant.toString()
      )
    : [],
  date: meeting.date,
  startTime: meeting.startTime,
  endTime: meeting.endTime,
  meetingType: meeting.meetingType,
  status: meeting.status,
  notes: meeting.notes,
  meetingLink: meeting.meetingLink,
  roomId: meeting.roomId,
  rejectedBy: meeting.rejectedBy?.toString() || null,
  cancelledBy: meeting.cancelledBy?.toString() || null,
  createdAt: meeting.createdAt,
  updatedAt: meeting.updatedAt
});

const toMinutes = (time) => {
  const [hours, minutes] = String(time).split(':').map(Number);
  return hours * 60 + minutes;
};

const hasTimeConflict = async ({
  userIds,
  date,
  startTime,
  endTime,
  excludeMeetingId = null
}) => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  const query = {
    date,
    status: { $in: ['pending', 'accepted', 'rescheduled'] },
    $or: [
      { organizer: { $in: userIds } },
      { participants: { $in: userIds } }
    ]
  };

  if (excludeMeetingId) {
    query._id = { $ne: excludeMeetingId };
  }

  const meetings = await Meeting.find(query);

  return meetings.some((meeting) => {
    const existingStart = toMinutes(meeting.startTime);
    const existingEnd = toMinutes(meeting.endTime);

    return start < existingEnd && end > existingStart;
  });
};

export const createMeeting = async (req, res, next) => {
  try {
    const organizerId = req.user._id.toString();
    const {
      title,
      participants,
      date,
      startTime,
      endTime,
      meetingType = 'video',
      notes = ''
    } = req.body;

    if (!title || !date || !startTime || !endTime) {
      res.status(400);
      throw new Error('Title, date, start time, and end time are required');
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      res.status(400);
      throw new Error('At least one participant is required');
    }

    const invalidParticipant = participants.find(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidParticipant) {
      res.status(400);
      throw new Error('Invalid participant id');
    }

    if (participants.includes(organizerId)) {
      res.status(400);
      throw new Error('You cannot schedule a meeting with yourself');
    }

    if (toMinutes(startTime) >= toMinutes(endTime)) {
      res.status(400);
      throw new Error('End time must be after start time');
    }

    const foundUsers = await User.find({ _id: { $in: participants } });

    if (foundUsers.length !== participants.length) {
      res.status(404);
      throw new Error('One or more participants were not found');
    }

    const allUserIds = [organizerId, ...participants];

    const conflict = await hasTimeConflict({
      userIds: allUserIds,
      date,
      startTime,
      endTime
    });

    if (conflict) {
      res.status(409);
      throw new Error('Meeting time conflicts with an existing meeting');
    }

    const roomId = new mongoose.Types.ObjectId().toString();
    const meetingLink = `/video-call/${roomId}`;

    const meeting = await Meeting.create({
      title,
      organizer: organizerId,
      participants,
      date,
      startTime,
      endTime,
      meetingType,
      notes,
      roomId,
      meetingLink
    });

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('organizer', 'name email role avatarUrl')
      .populate('participants', 'name email role avatarUrl');

    const io = req.app.get('io');

    if (io) {
      allUserIds.forEach((userId) => {
        io.to(`user:${userId}`).emit('meeting:updated', formatMeeting(populatedMeeting));
      });
    }

    res.status(201).json({
      meeting: formatMeeting(populatedMeeting)
    });
  } catch (error) {
    next(error);
  }
};

export const getMyMeetings = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();

    const meetings = await Meeting.find({
      $or: [{ organizer: currentUserId }, { participants: currentUserId }]
    })
      .populate('organizer', 'name email role avatarUrl')
      .populate('participants', 'name email role avatarUrl')
      .sort({ date: 1, startTime: 1 });

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
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      res.status(404);
      throw new Error('Meeting not found');
    }

    const isParticipant = meeting.participants.some(
      (id) => id.toString() === currentUserId
    );

    if (!isParticipant) {
      res.status(403);
      throw new Error('Only participants can accept this meeting');
    }

    meeting.status = 'accepted';
    await meeting.save();

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('organizer', 'name email role avatarUrl')
      .populate('participants', 'name email role avatarUrl');

    const io = req.app.get('io');
    const notifyUsers = [
      meeting.organizer.toString(),
      ...meeting.participants.map((id) => id.toString())
    ];

    if (io) {
      notifyUsers.forEach((userId) => {
        io.to(`user:${userId}`).emit('meeting:updated', formatMeeting(populatedMeeting));
      });
    }

    res.status(200).json({
      meeting: formatMeeting(populatedMeeting)
    });
  } catch (error) {
    next(error);
  }
};

export const rejectMeeting = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      res.status(404);
      throw new Error('Meeting not found');
    }

    const isParticipant = meeting.participants.some(
      (id) => id.toString() === currentUserId
    );

    if (!isParticipant) {
      res.status(403);
      throw new Error('Only participants can reject this meeting');
    }

    meeting.status = 'rejected';
    meeting.rejectedBy = currentUserId;
    await meeting.save();

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('organizer', 'name email role avatarUrl')
      .populate('participants', 'name email role avatarUrl');

    const io = req.app.get('io');
    const notifyUsers = [
      meeting.organizer.toString(),
      ...meeting.participants.map((id) => id.toString())
    ];

    if (io) {
      notifyUsers.forEach((userId) => {
        io.to(`user:${userId}`).emit('meeting:updated', formatMeeting(populatedMeeting));
      });
    }

    res.status(200).json({
      meeting: formatMeeting(populatedMeeting)
    });
  } catch (error) {
    next(error);
  }
};

export const cancelMeeting = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      res.status(404);
      throw new Error('Meeting not found');
    }

    const isOrganizer = meeting.organizer.toString() === currentUserId;
    const isParticipant = meeting.participants.some(
      (id) => id.toString() === currentUserId
    );

    if (!isOrganizer && !isParticipant) {
      res.status(403);
      throw new Error('You are not allowed to cancel this meeting');
    }

    meeting.status = 'cancelled';
    meeting.cancelledBy = currentUserId;
    await meeting.save();

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('organizer', 'name email role avatarUrl')
      .populate('participants', 'name email role avatarUrl');

    const io = req.app.get('io');
    const notifyUsers = [
      meeting.organizer.toString(),
      ...meeting.participants.map((id) => id.toString())
    ];

    if (io) {
      notifyUsers.forEach((userId) => {
        io.to(`user:${userId}`).emit('meeting:updated', formatMeeting(populatedMeeting));
      });
    }

    res.status(200).json({
      meeting: formatMeeting(populatedMeeting)
    });
  } catch (error) {
    next(error);
  }
};

export const rescheduleMeeting = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();
    const { date, startTime, endTime, notes } = req.body;

    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      res.status(404);
      throw new Error('Meeting not found');
    }

    if (meeting.organizer.toString() !== currentUserId) {
      res.status(403);
      throw new Error('Only organizer can reschedule this meeting');
    }

    const newDate = date || meeting.date;
    const newStartTime = startTime || meeting.startTime;
    const newEndTime = endTime || meeting.endTime;

    if (toMinutes(newStartTime) >= toMinutes(newEndTime)) {
      res.status(400);
      throw new Error('End time must be after start time');
    }

    const allUserIds = [
      meeting.organizer.toString(),
      ...meeting.participants.map((id) => id.toString())
    ];

    const conflict = await hasTimeConflict({
      userIds: allUserIds,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      excludeMeetingId: meeting._id
    });

    if (conflict) {
      res.status(409);
      throw new Error('New meeting time conflicts with an existing meeting');
    }

    meeting.date = newDate;
    meeting.startTime = newStartTime;
    meeting.endTime = newEndTime;
    meeting.status = 'rescheduled';

    if (typeof notes === 'string') {
      meeting.notes = notes;
    }

    await meeting.save();

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('organizer', 'name email role avatarUrl')
      .populate('participants', 'name email role avatarUrl');

    const io = req.app.get('io');

    if (io) {
      allUserIds.forEach((userId) => {
        io.to(`user:${userId}`).emit('meeting:updated', formatMeeting(populatedMeeting));
      });
    }

    res.status(200).json({
      meeting: formatMeeting(populatedMeeting)
    });
  } catch (error) {
    next(error);
  }
};
