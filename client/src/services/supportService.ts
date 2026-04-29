import { API } from './api';

export const submitSupportMessageApi = async (payload: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<{ message: string }> => {
  const { data } = await API.post('/support', payload);
  return data;
};

export const getMySupportMessagesApi = async (): Promise<{
  messages: {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'open' | 'in_progress' | 'resolved';
    createdAt: string;
  }[];
}> => {
  const { data } = await API.get('/support/my');
  return data;
};
