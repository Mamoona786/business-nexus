import { API } from './api';
import { Meeting, MeetingType } from '../types';

export interface CreateMeetingPayload {
  title: string;
  participants: string[];
  date: string;
  startTime: string;
  endTime: string;
  meetingType: MeetingType;
  notes?: string;
}

export interface RescheduleMeetingPayload {
  date?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export const getMyMeetingsApi = async (): Promise<{ meetings: Meeting[] }> => {
  const { data } = await API.get('/meetings');
  return data;
};

export const createMeetingApi = async (
  payload: CreateMeetingPayload
): Promise<{ meeting: Meeting }> => {
  const { data } = await API.post('/meetings', payload);
  return data;
};

export const acceptMeetingApi = async (
  meetingId: string
): Promise<{ meeting: Meeting }> => {
  const { data } = await API.patch(`/meetings/${meetingId}/accept`);
  return data;
};

export const rejectMeetingApi = async (
  meetingId: string
): Promise<{ meeting: Meeting }> => {
  const { data } = await API.patch(`/meetings/${meetingId}/reject`);
  return data;
};

export const cancelMeetingApi = async (
  meetingId: string
): Promise<{ meeting: Meeting }> => {
  const { data } = await API.patch(`/meetings/${meetingId}/cancel`);
  return data;
};

export const rescheduleMeetingApi = async (
  meetingId: string,
  payload: RescheduleMeetingPayload
): Promise<{ meeting: Meeting }> => {
  const { data } = await API.patch(`/meetings/${meetingId}/reschedule`, payload);
  return data;
};
