import { API } from './api';
import { CollaborationRequest, CollaborationStatus } from '../types';

export const sendCollaborationRequestApi = async (
  entrepreneurId: string,
  message: string
): Promise<{ message: string; request: CollaborationRequest }> => {
  const { data } = await API.post<{ message: string; request: CollaborationRequest }>(
    '/collaborations',
    { entrepreneurId, message }
  );
  return data;
};

export const getMyCollaborationRequestsApi = async (
  type?: 'incoming' | 'outgoing'
): Promise<{ requests: CollaborationRequest[] }> => {
  const { data } = await API.get<{ requests: CollaborationRequest[] }>(
    '/collaborations/my-requests',
    {
      params: { type }
    }
  );
  return data;
};

export const updateCollaborationStatusApi = async (
  requestId: string,
  status: CollaborationStatus
): Promise<{ message: string; request: CollaborationRequest }> => {
  const { data } = await API.patch<{ message: string; request: CollaborationRequest }>(
    `/collaborations/${requestId}/status`,
    { status }
  );
  return data;
};

export const getDealsApi = async (): Promise<{ deals: CollaborationRequest[] }> => {
  const { data } = await API.get<{ deals: CollaborationRequest[] }>(
    '/collaborations/deals'
  );
  return data;
};
