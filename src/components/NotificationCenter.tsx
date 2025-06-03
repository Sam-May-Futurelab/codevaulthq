import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, BellOff, Heart, Eye, MessageCircle, UserPlus, Volume2, VolumeX } from 'lucide-react';
import { useNotificationSystem } from '../hooks/useNotificationSystem';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    requestNotificationPermission
  } = useNotificationSystem();

  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false);

  const toggleSound = () => setSoundEnabled(!soundEnabled);
  
  const requestBrowserNotifications = async () => {
    try {
      await requestNotificationPermission();
      setBrowserNotificationsEnabled(true);
    } catch (error) {
      console.warn('Failed to enable browser notifications:', error);
    }
  };
  
  const clearNotification = (id: string) => {
    dismissNotification(id);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-400" />;
      case 'view':
        return <Eye className="w-4 h-4 text-blue-400" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-green-400" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-vault-accent" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'border-red-400/20 bg-red-500/5';
      case 'view':
        return 'border-blue-400/20 bg-blue-500/5';
      case 'comment':
        return 'border-green-400/20 bg-green-500/5';
      case 'follow':
        return 'border-purple-400/20 bg-purple-500/5';
      default:
        return 'border-vault-accent/20 bg-vault-accent/5';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-vault-medium/50 hover:bg-vault-medium border border-vault-light/20 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-96 max-w-[90vw] bg-vault-dark border border-vault-light/20 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-vault-light/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {/* Sound Toggle */}
                    <button
                      onClick={toggleSound}
                      className="p-1.5 hover:bg-vault-medium/50 rounded-lg transition-colors"
                      title={soundEnabled ? 'Disable sound' : 'Enable sound'}
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-vault-accent" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {/* Browser Notifications Toggle */}
                    <button
                      onClick={requestBrowserNotifications}
                      className="p-1.5 hover:bg-vault-medium/50 rounded-lg transition-colors"
                      title={browserNotificationsEnabled ? 'Browser notifications enabled' : 'Enable browser notifications'}
                    >
                      {browserNotificationsEnabled ? (
                        <Bell className="w-4 h-4 text-vault-accent" />
                      ) : (
                        <BellOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {/* Close Button */}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 hover:bg-vault-medium/50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Mark All Read */}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-vault-accent text-sm hover:text-vault-accent/80 transition-colors mt-2"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No notifications yet</p>
                    <p className="text-gray-500 text-sm mt-1">
                      You'll see activity on your snippets here
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-vault-light/10">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-vault-medium/30 transition-colors cursor-pointer ${
                          !notification.read ? 'border-l-4 border-vault-accent' : ''
                        } ${getNotificationColor(notification.type)}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium">
                                {notification.title}
                              </p>
                              <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-gray-500 text-xs mt-2">
                                {getRelativeTime(notification.timestamp)}
                              </p>
                            </div>
                          </div>

                          {/* Close individual notification */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notification.id);
                            }}
                            className="p-1 hover:bg-vault-light/20 rounded-full transition-colors opacity-0 group-hover:opacity-100 ml-2"
                          >
                            <X className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>

                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-vault-accent rounded-full absolute right-2 top-4"></div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer with settings hint */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-vault-light/20 text-center">
                  <p className="text-gray-500 text-xs">
                    Notifications are kept for 7 days
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper function to get relative time
function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
}

export default NotificationCenter;
