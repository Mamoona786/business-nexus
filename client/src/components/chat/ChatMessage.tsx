import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { Message, User } from '../../types';
import { Avatar } from '../ui/Avatar';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  sender?: User | null;
  currentUser?: User | null;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isCurrentUser,
  sender,
  currentUser
}) => {
  const avatarUser = isCurrentUser ? currentUser : sender;

  return (
    <div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}
    >
      {!isCurrentUser && (
        <Avatar
          src={avatarUser?.avatarUrl || ''}
          alt={avatarUser?.name || 'User'}
          size="sm"
          className="mr-2 self-end"
        />
      )}

      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
            isCurrentUser
              ? 'bg-primary-600 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <span>
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>

          {isCurrentUser && (
            <span title={message.isRead ? 'Read' : 'Delivered'}>
              {message.isRead ? (
                <CheckCheck size={14} className="text-primary-600" />
              ) : (
                <Check size={14} />
              )}
            </span>
          )}
        </div>
      </div>

      {isCurrentUser && (
        <Avatar
          src={avatarUser?.avatarUrl || ''}
          alt={avatarUser?.name || 'You'}
          size="sm"
          className="ml-2 self-end"
        />
      )}
    </div>
  );
};
