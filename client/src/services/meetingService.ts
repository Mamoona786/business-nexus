import { API } from './api';
import { Meeting } from '../types';

export interface ScheduleMeetingPayload {
  title: string;
  participantIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  meetingType: 'video' | 'audio' | 'in_person';
  notes?: string;
}

export const getMeetingsApi = async (): Promise<{ meetings: Meeting[] }> => {
  const { data } = await API.get('/meetings');
  return data;
};

export const scheduleMeetingApi = async (
  payload: ScheduleMeetingPayload
): Promise<{ message: string; meeting: Meeting }> => {
  const { data } = await API.post('/meetings', payload);
  return data;
};

export const acceptMeetingApi = async (
  meetingId: string
): Promise<{ message: string; meeting: Meeting }> => {
  const { data } = await API.patch(`/meetings/${meetingId}/accept`);
  return data;
};

export const rejectMeetingApi = async (
  meetingId: string
): Promise<{ message: string; meeting: Meeting }> => {
  const { data } = await API.patch(`/meetings/${meetingId}/reject`);
  return data;
};

export const cancelMeetingApi = async (
  meetingId: string
): Promise<{ message: string; meeting: Meeting }> => {
  const { data } = await API.patch(`/meetings/${meetingId}/cancel`);
  return data;
};

export const rescheduleMeetingApi = async (
  meetingId: string,
  payload: {
    date?: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
  }
): Promise<{ message: string; meeting: Meeting }> => {
  const { data } = await API.patch(`/meetings/${meetingId}/reschedule`, payload);
  return data;
};
