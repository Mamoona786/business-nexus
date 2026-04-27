import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  MessageCircle,
  User,
  LogOut,
  Building2,
  CircleDollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { getUnreadMessageCountApi } from '../../services/messageService';
import { connectSocket } from '../../services/socket';
import { getUnreadNotificationCountApi } from '../../services/notificationService';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const loadUnreadNotifications = async () => {
  if (!user) {
    setUnreadNotifications(0);
    return;
  }

  try {
    const response = await getUnreadNotificationCountApi();
    setUnreadNotifications(response.unreadCount);
  } catch (error) {
    console.error('Failed to load unread notifications', error);
  }
};

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const loadUnreadMessages = async () => {
    if (!user) {
      setUnreadMessages(0);
      return;
    }

    try {
      const response = await getUnreadMessageCountApi();
      setUnreadMessages(response.unreadCount);
    } catch (error) {
      console.error('Failed to load unread messages', error);
    }
  };

  useEffect(() => {
  if (!user) {
    setUnreadMessages(0);
    return;
  }

  loadUnreadMessages();
    loadUnreadNotifications();

  const socket = connectSocket();

  window.addEventListener('messages:updated', loadUnreadMessages);

  if (!socket) {
    return () => {
      window.removeEventListener('messages:updated', loadUnreadMessages);
    };
  }

  socket.on('message:new', loadUnreadMessages);
  socket.on('messages:read', loadUnreadMessages);
    socket.on('notification:new', loadUnreadNotifications);
  window.addEventListener('notifications:updated', loadUnreadNotifications);

  return () => {
    socket.off('message:new', loadUnreadMessages);
    socket.off('messages:read', loadUnreadMessages);
    window.removeEventListener('messages:updated', loadUnreadMessages);
        socket.off('notification:new', loadUnreadNotifications);
    window.removeEventListener('notifications:updated', loadUnreadNotifications);
  };
}, [user]);

  const dashboardRoute =
    user?.role === 'entrepreneur'
      ? '/dashboard/entrepreneur'
      : '/dashboard/investor';

  const profileRoute = user ? `/profile/${user.role}/${user.id}` : '/login';

  const navLinks = [
    {
      icon:
        user?.role === 'entrepreneur' ? (
          <Building2 size={18} />
        ) : (
          <CircleDollarSign size={18} />
        ),
      text: 'Dashboard',
      path: dashboardRoute
    },
    {
      icon: <MessageCircle size={18} />,
      text: 'Messages',
      path: user ? '/messages' : '/login',
      badge: unreadMessages
    },
    {
      icon: <Bell size={18} />,
      text: 'Notifications',
      path: user ? '/notifications' : '/login'
    },
    {
      icon: <User size={18} />,
      text: 'Profile',
      path: profileRoute
    }
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">
                Business Nexus
              </span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:ml-6">
            {user ? (
              <div className="flex items-center space-x-4">
                {navLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.path}
                    className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  >
                    <span className="mr-2 relative">
                      {link.icon}

                      {link.text === 'Messages' && unreadMessages > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-1 leading-none">
                          {unreadMessages > 99 ? '99+' : unreadMessages}
                        </span>
                      )}
                    </span>

                    {link.text}
                  </Link>
                ))}

                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  leftIcon={<LogOut size={18} />}
                >
                  Logout
                </Button>

                <Link to={profileRoute} className="flex items-center space-x-2 ml-2">
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.name}
                    size="sm"
                    status={user.isOnline ? 'online' : 'offline'}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="relative inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50 focus:outline-none"
            >
              {unreadMessages > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-1 leading-none">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}

              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <div className="flex items-center space-x-3 px-3 py-2">
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.name}
                    size="sm"
                    status={user.isOnline ? 'online' : 'offline'}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-2">
                  {navLinks.map((link, index) => (
                    <Link
                      key={index}
                      to={link.path}
                      className="flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="flex items-center">
                        <span className="mr-3">{link.icon}</span>
                        {link.text}
                      </span>

                      {link.text === 'Messages' && unreadMessages > 0 && (
                        <span className="bg-red-600 text-white text-xs min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1">
                          {unreadMessages > 99 ? '99+' : unreadMessages}
                        </span>
                      )}

                      {link.text === 'Notifications' && unreadNotifications > 0 && (
  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-1 leading-none">
    {unreadNotifications > 99 ? '99+' : unreadNotifications}
  </span>
)}
                    </Link>
                  ))}

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  >
                    <LogOut size={18} className="mr-3" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Link
                  to="/login"
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="outline" fullWidth>
                    Log in
                  </Button>
                </Link>
                <Link
                  to="/register"
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button fullWidth>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
