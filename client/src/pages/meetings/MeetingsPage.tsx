import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Calendar, Check, X, Video, Ban, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Meeting, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
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

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    participantId: '',
    date: '',
    startTime: '',
    endTime: '',
    meetingType: 'video' as 'video' | 'audio' | 'in_person',
    notes: ''
  });

  const loadMeetings = async () => {
    try {
      const response = await getMeetingsApi();
      setMeetings(response.meetings);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const endpoint = user?.role === 'entrepreneur' ? '/users/investors' : '/users/entrepreneurs';
      const { data } = await API.get(endpoint);

      const list = data.users || data.investors || data.entrepreneurs || [];
      setUsers(list);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!user) return;

    loadMeetings();
    loadUsers();

    const socket = connectSocket();

    if (!socket) return;

    socket.on('meeting:updated', loadMeetings);

    return () => {
      socket.off('meeting:updated', loadMeetings);
    };
  }, [user]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.participantId || !form.date || !form.startTime || !form.endTime) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setSaving(true);

      const response = await scheduleMeetingApi({
        title: form.title,
        participantIds: [form.participantId],
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        meetingType: form.meetingType,
        notes: form.notes
      });

      toast.success(response.message);
      setForm({
        title: '',
        participantId: '',
        date: '',
        startTime: '',
        endTime: '',
        meetingType: 'video',
        notes: ''
      });
      await loadMeetings();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to schedule meeting');
    } finally {
      setSaving(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const response = await acceptMeetingApi(id);
      toast.success(response.message);
      await loadMeetings();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to accept meeting');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await rejectMeetingApi(id);
      toast.success(response.message);
      await loadMeetings();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to reject meeting');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const response = await cancelMeetingApi(id);
      toast.success(response.message);
      await loadMeetings();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to cancel meeting');
    }
  };

  const handleQuickReschedule = async (meeting: Meeting) => {
    const newDate = window.prompt('Enter new date YYYY-MM-DD', meeting.date);
    if (!newDate) return;

    const newStartTime = window.prompt('Enter new start time HH:mm', meeting.startTime);
    if (!newStartTime) return;

    const newEndTime = window.prompt('Enter new end time HH:mm', meeting.endTime);
    if (!newEndTime) return;

    try {
      const response = await rescheduleMeetingApi(meeting.id, {
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime
      });

      toast.success(response.message);
      await loadMeetings();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to reschedule meeting');
    }
  };

  const getName = (value: User | string) => {
    if (typeof value === 'string') return value;
    return value.name;
  };

  const getCreatedById = (meeting: Meeting) => {
    if (typeof meeting.createdBy === 'string') return meeting.createdBy;
    return meeting.createdBy.id;
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Calendar className="mr-2" size={26} />
          Meetings
        </h1>
        <p className="text-gray-600 mt-1">
          Schedule, accept, reject, cancel and join video meetings.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Schedule New Meeting
        </h2>

        <form onSubmit={handleSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Investment discussion"
            fullWidth
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Participant
            </label>
            <select
              value={form.participantId}
              onChange={(e) => setForm({ ...form, participantId: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select participant</option>
              {users
                .filter((item) => item.id !== user.id)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.role}
                  </option>
                ))}
            </select>
          </div>

          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            fullWidth
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              fullWidth
            />
            <Input
              label="End Time"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              fullWidth
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Type
            </label>
            <select
              value={form.meetingType}
              onChange={(e) =>
                setForm({
                  ...form,
                  meetingType: e.target.value as 'video' | 'audio' | 'in_person'
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="in_person">In Person</option>
            </select>
          </div>

          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Optional meeting notes"
            fullWidth
          />

          <div className="md:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Calendar</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading meetings...</div>
        ) : meetings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No meetings scheduled yet.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {meetings.map((meeting) => {
              const isCreator = getCreatedById(meeting) === user.id;

              return (
                <div key={meeting.id} className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                      <span className="text-xs capitalize px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {meeting.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">
                      {meeting.date} | {meeting.startTime} - {meeting.endTime}
                    </p>

                    <p className="text-sm text-gray-600 mt-1 capitalize">
                      Type: {meeting.meetingType.replace('_', ' ')}
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                      Participants:{' '}
                      {(meeting.participants as Array<User | string>)
                        .map(getName)
                        .join(', ')}
                    </p>

                    {meeting.notes && (
                      <p className="text-sm text-gray-500 mt-1">{meeting.notes}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {meeting.status === 'pending' && !isCreator && (
                      <>
                        <Button size="sm" onClick={() => handleAccept(meeting.id)} leftIcon={<Check size={16} />}>
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReject(meeting.id)} leftIcon={<X size={16} />}>
                          Reject
                        </Button>
                      </>
                    )}

                    {isCreator && !['cancelled', 'rejected'].includes(meeting.status) && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleQuickReschedule(meeting)} leftIcon={<Clock size={16} />}>
                          Reschedule
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleCancel(meeting.id)} leftIcon={<Ban size={16} />}>
                          Cancel
                        </Button>
                      </>
                    )}

                    {meeting.meetingType === 'video' &&
                      meeting.roomId &&
                      ['accepted', 'rescheduled', 'pending'].includes(meeting.status) && (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/video-call/${meeting.roomId}`)}
                          leftIcon={<Video size={16} />}
                        >
                          Join Call
                        </Button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
