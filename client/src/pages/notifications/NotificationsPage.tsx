import React, { useEffect, useState } from 'react';
import {
  Bell,
  MessageCircle,
  UserPlus,
  DollarSign,
  Calendar,
  FileText,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { AppNotification } from '../../types';
import {
  deleteNotificationApi,
  getNotificationsApi,
  markAllNotificationsAsReadApi,
  markNotificationAsReadApi
} from '../../services/notificationService';
import { connectSocket } from '../../services/socket';

const formatTime = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
};

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle size={16} className="text-primary-600" />;
      case 'collaboration':
        return <UserPlus size={16} className="text-secondary-600" />;
      case 'payment':
        return <DollarSign size={16} className="text-accent-600" />;
      case 'meeting':
        return <Calendar size={16} className="text-blue-600" />;
      case 'document':
        return <FileText size={16} className="text-purple-600" />;
      default:
        return <Bell size={16} className="text-gray-600" />;
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await getNotificationsApi();
      setNotifications(response.notifications);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    const socket = connectSocket();

    if (!socket) return;

    const handleNewNotification = ({ notification }: { notification: AppNotification }) => {
      setNotifications((prev) => [notification, ...prev]);
      window.dispatchEvent(new Event('notifications:updated'));
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, []);

  const handleMarkRead = async (notification: AppNotification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsReadApi(notification.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, isRead: true } : item
          )
        );
        window.dispatchEvent(new Event('notifications:updated'));
      }

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsReadApi();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      window.dispatchEvent(new Event('notifications:updated'));
      toast.success('All notifications marked as read');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotificationApi(id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      window.dispatchEvent(new Event('notifications:updated'));
      toast.success('Notification deleted');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete notification');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your network activity</p>
        </div>

        <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
          Mark all as read
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardBody className="p-6 text-gray-600">Loading notifications...</CardBody>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardBody className="p-6 text-gray-600">No notifications found.</CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors duration-200 ${
                !notification.isRead ? 'bg-primary-50' : ''
              }`}
            >
              <CardBody className="flex items-start p-4">
                <Avatar
                  src={notification.sender?.avatarUrl || ''}
                  alt={notification.sender?.name || 'Notification'}
                  size="md"
                  className="flex-shrink-0 mr-4"
                />

                <button
                  type="button"
                  onClick={() => handleMarkRead(notification)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {notification.sender?.name || notification.title}
                    </span>

                    {!notification.isRead && (
                      <Badge variant="primary" size="sm" rounded>
                        New
                      </Badge>
                    )}
                  </div>

                  <p className="text-gray-900 mt-1 font-medium">{notification.title}</p>
                  <p className="text-gray-600 mt-1">{notification.message}</p>

                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    {getNotificationIcon(notification.type)}
                    <span>{formatTime(notification.createdAt)}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(notification.id)}
                  className="ml-3 text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
