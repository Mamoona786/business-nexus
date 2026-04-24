import { API } from './api';
import { ChatConversation, Message, User } from '../types';

export const getConversationsApi = async (): Promise<{
  conversations: ChatConversation[];
}> => {
  const { data } = await API.get<{ conversations: ChatConversation[] }>(
    '/messages/conversations'
  );
  return data;
};

export const getChatMessagesApi = async (
  userId: string
): Promise<{ chatPartner: User; messages: Message[] }> => {
  const { data } = await API.get<{ chatPartner: User; messages: Message[] }>(
    `/messages/${userId}`
  );
  return data;
};

export const sendMessageApi = async (
  receiverId: string,
  content: string
): Promise<{ message: Message }> => {
  const { data } = await API.post<{ message: Message }>('/messages', {
    receiverId,
    content
  });
  return data;
};
