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
