import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChatUserList } from '../../components/chat/ChatUserList';
import { ChatConversation } from '../../types';
import { getConversationsApi } from '../../services/messageService';
import { connectSocket } from '../../services/socket';
import { MessageCircle } from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await getConversationsApi();
        setConversations(response.conversations);
      } catch (error) {
        console.error('Failed to load conversations', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    const socket = connectSocket();

    if (!socket) return;

    const refreshConversations = async () => {
      try {
        const response = await getConversationsApi();
        setConversations(response.conversations);
      } catch (error) {
        console.error('Failed to refresh conversations', error);
      }
    };

    socket.on('message:new', refreshConversations);
    socket.on('messages:read', refreshConversations);
    socket.on('users:online', refreshConversations);

    return () => {
      socket.off('message:new', refreshConversations);
      socket.off('messages:read', refreshConversations);
      socket.off('users:online', refreshConversations);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
      {loading ? (
        <div className="h-full flex items-center justify-center text-gray-500">
          Loading conversations...
        </div>
      ) : conversations.length > 0 ? (
        <ChatUserList conversations={conversations} />
      ) : (
        <div className="h-full flex flex-col items-center justify-center p-8">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <MessageCircle size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-900">No messages yet</h2>
          <p className="text-gray-600 text-center mt-2">
            Start connecting with entrepreneurs and investors to begin conversations
          </p>
        </div>
      )}
    </div>
  );
};
