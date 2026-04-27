import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  Video,
  Check,
  X,
  Ban,
  RefreshCcw,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { API } from '../../services/api';
import { connectSocket } from '../../services/socket';
import {
  acceptMeetingApi,
  cancelMeetingApi,
  getMeetingsApi,
  rejectMeetingApi,
  rescheduleMeetingApi,
  scheduleMeetingApi
} from '../../services/meetingService';
import { Meeting, User, MeetingType } from '../../types';

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [meetingType, setMeetingType] = useState<MeetingType>('video');
  const [notes, setNotes] = useState('');

  const loadMeetings = async () => {
    try {
      const response = await getMeetingsApi();
      setMeetings(response.meetings);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await API.get('/users');

      const list =
        data.users ||
        data.entrepreneurs ||
        data.investors ||
        data.data ||
        data ||
        [];

      const normalizedUsers = list.map((item: any) => ({
        ...item,
        id: item.id || item._id
      }));

      setUsers(normalizedUsers.filter((item: User) => item.id !== user?.id));
    } catch (error) {
      console.log('Users API failed:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    loadMeetings();
    loadUsers();
  }, [user]);

  useEffect(() => {
    const socket = connectSocket();

    if (!socket) return;

    const handleMeetingUpdate = () => {
      loadMeetings();
    };

    socket.on('meeting:updated', handleMeetingUpdate);

    return () => {
      socket.off('meeting:updated', handleMeetingUpdate);
    };
  }, []);

  const groupedMeetings = useMemo(() => {
    return meetings.reduce<Record<string, Meeting[]>>((groups, meeting) => {
      if (!groups[meeting.date]) groups[meeting.date] = [];
      groups[meeting.date].push(meeting);
      return groups;
    }, {});
  }, [meetings]);

  const resetForm = () => {
    setTitle('');
    setParticipantIds([]);
    setDate('');
    setStartTime('');
    setEndTime('');
    setMeetingType('video');
    setNotes('');
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await scheduleMeetingApi({
        title,
        participantIds,
        date,
        startTime,
        endTime,
        meetingType,
        notes
      });

      setMeetings((prev) => [...prev, response.meeting]);
      toast.success(response.message);
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to schedule meeting');
    }
  };

  const handleAccept = async (meetingId: string) => {
    try {
      const response = await acceptMeetingApi(meetingId);
      toast.success(response.message);
      loadMeetings();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to accept meeting');
    }
  };

  const handleReject = async (meetingId: string) => {
    try {
      const response = await rejectMeetingApi(meetingId);
      toast.success(response.message);
      loadMeetings();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to reject meeting');
    }
  };

  const handleCancel = async (meetingId: string) => {
    try {
      const response = await cancelMeetingApi(meetingId);
      toast.success(response.message);
      loadMeetings();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to cancel meeting');
    }
  };

  const handleReschedule = async (meeting: Meeting) => {
    const newDate = window.prompt('Enter new date YYYY-MM-DD', meeting.date);
    const newStartTime = window.prompt('Enter new start time HH:mm', meeting.startTime);
    const newEndTime = window.prompt('Enter new end time HH:mm', meeting.endTime);

    if (!newDate || !newStartTime || !newEndTime) return;

    try {
      const response = await rescheduleMeetingApi(meeting.id, {
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        notes: meeting.notes
      });

      toast.success(response.message);
      loadMeetings();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to reschedule meeting');
    }
  };

  const getParticipantNames = (meeting: Meeting) => {
    if (!Array.isArray(meeting.participants)) return '';

    return meeting.participants
      .map((participant: any) => {
        if (typeof participant === 'string') return participant;
        return participant.name;
      })
      .join(', ');
  };

  const isCreator = (meeting: Meeting) => {
    if (!user) return false;

    if (typeof meeting.createdBy === 'string') {
      return meeting.createdBy === user.id;
    }

    return meeting.createdBy.id === user.id;
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600">
            Schedule meetings, manage requests, and join video calls.
          </p>
        </div>

        <Button onClick={() => setShowForm((prev) => !prev)} leftIcon={<Plus size={18} />}>
          Schedule Meeting
        </Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <form onSubmit={handleScheduleMeeting} className="space-y-4">
            <Input
              label="Meeting Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Investor discussion"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Participants
              </label>

              <select
                multiple
                value={participantIds}
                onChange={(e) =>
                  setParticipantIds(
                    Array.from(e.target.selectedOptions, (option) => option.value)
                  )
                }
                className="w-full border border-gray-300 rounded-lg p-2 min-h-[120px]"
                required
              >
                {users.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {item.role}
                  </option>
                ))}
              </select>

              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl and click to select multiple participants.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />

              <Input
                label="Start Time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />

              <Input
                label="End Time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Type
              </label>

              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value as MeetingType)}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="in_person">In Person</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Meeting agenda..."
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit">Create Meeting</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
          Loading meetings...
        </div>
      ) : meetings.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <Calendar size={40} className="mx-auto text-gray-400 mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">No meetings yet</h2>
          <p className="text-gray-600">Schedule your first meeting to get started.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedMeetings).map(([meetingDate, items]) => (
            <div key={meetingDate}>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {new Date(meetingDate).toDateString()}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {items.map((meeting) => {
                  const isExpired =
                    new Date(meeting.endDateTime).getTime() <= Date.now();

                  const canShowVideoAction =
                    meeting.meetingType === 'video' &&
                    !!meeting.roomId &&
                    meeting.status !== 'cancelled' &&
                    meeting.status !== 'rejected';

                  return (
                    <Card key={meeting.id} className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                          <p className="text-sm text-gray-600">
                            Participants: {getParticipantNames(meeting)}
                          </p>
                        </div>

                        <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                          {meeting.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          {meeting.startTime} - {meeting.endTime}
                        </span>

                        <span className="flex items-center gap-1 capitalize">
                          <Video size={16} />
                          {meeting.meetingType.replace('_', ' ')}
                        </span>
                      </div>

                      {meeting.notes && (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                          {meeting.notes}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {meeting.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAccept(meeting.id)}
                              leftIcon={<Check size={16} />}
                            >
                              Accept
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(meeting.id)}
                              leftIcon={<X size={16} />}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {canShowVideoAction &&
                          (isExpired ? (
                            <span className="text-sm text-gray-500 px-3 py-2 rounded-lg bg-gray-100">
                              Meeting time passed
                            </span>
                          ) : (
                            <Link to={`/video-call/${meeting.roomId}`}>
                              <Button size="sm" leftIcon={<Video size={16} />}>
                                Join Call
                              </Button>
                            </Link>
                          ))}

                        {isCreator(meeting) && meeting.status !== 'cancelled' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReschedule(meeting)}
                              leftIcon={<RefreshCcw size={16} />}
                            >
                              Reschedule
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(meeting.id)}
                              leftIcon={<Ban size={16} />}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
