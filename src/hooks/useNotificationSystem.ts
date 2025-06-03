/**
 * Real-time Notification System
 * Handles notifications for likes, comments, and other engagement activities
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

interface NotificationData {
  id: string;
  type: 'like' | 'comment' | 'share' | 'follow' | 'mention';
  title: string;
  message: string;
  snippetId?: string;
  snippetTitle?: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

interface NotificationOptions {
  /** Enable browser notifications */
  enableBrowserNotifications?: boolean;
  /** Enable sound notifications */
  enableSounds?: boolean;
  /** Auto-dismiss time in milliseconds */
  autoDismissTime?: number;
  /** Maximum notifications to show at once */
  maxVisible?: number;
  /** Enable real-time subscription */
  realTimeUpdates?: boolean;
}

export const useNotificationSystem = (options: NotificationOptions = {}) => {
  const {
    enableBrowserNotifications = true,
    enableSounds = true,
    autoDismissTime = 5000,
    maxVisible = 5,
    realTimeUpdates = true
  } = options;

  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const audioContext = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (enableSounds && !audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, [enableSounds]);

  // Play notification sound
  const playNotificationSound = useCallback((type: NotificationData['type']) => {
    if (!enableSounds || !audioContext.current) return;

    const ctx = audioContext.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Different frequencies for different notification types
    const frequencies = {
      like: 800,
      comment: 600,
      share: 700,
      follow: 900,
      mention: 750
    };

    oscillator.frequency.setValueAtTime(frequencies[type], ctx.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  }, [enableSounds]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!enableBrowserNotifications || !('Notification' in window)) return false;

    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, [enableBrowserNotifications]);

  // Show browser notification
  const showBrowserNotification = useCallback(async (notification: NotificationData) => {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      tag: notification.id,
      requireInteraction: false,
      silent: !enableSounds
    });

    browserNotification.onclick = () => {
      window.focus();
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
      browserNotification.close();
    };

    // Auto-close after delay
    setTimeout(() => {
      browserNotification.close();
    }, autoDismissTime);
  }, [requestNotificationPermission, enableSounds, autoDismissTime]);

  // Add new notification
  const addNotification = useCallback((notificationData: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: NotificationData = {
      ...notificationData,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 50); // Keep latest 50
      return updated;
    });

    setUnreadCount(prev => prev + 1);

    // Play sound
    playNotificationSound(newNotification.type);

    // Show browser notification
    if (document.hidden || !isVisible) {
      showBrowserNotification(newNotification);
    }

    // Auto-dismiss after delay
    if (autoDismissTime > 0) {
      setTimeout(() => {
        dismissNotification(newNotification.id);
      }, autoDismissTime);
    }

    return newNotification;
  }, [playNotificationSound, showBrowserNotification, isVisible, autoDismissTime]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );

    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    // Also mark as read if it wasn't already
    setUnreadCount(prev => {
      const notification = prev === 0 ? null : notifications.find(n => n.id === notificationId && !n.read);
      return notification ? Math.max(0, prev - 1) : prev;
    });
  }, [notifications]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Mock subscription to real-time notifications
  // In a real implementation, this would connect to Firebase or WebSocket
  useEffect(() => {
    if (!currentUser || !realTimeUpdates) return;

    // Mock notification generator for demo
    const mockNotifications = () => {
      const types: NotificationData['type'][] = ['like', 'comment', 'share', 'follow'];
      const messages = {
        like: 'liked your snippet',
        comment: 'commented on your snippet',
        share: 'shared your snippet',
        follow: 'started following you',
        mention: 'mentioned you in a comment'
      };

      // Random chance to generate a notification
      if (Math.random() < 0.1) { // 10% chance every interval
        const type = types[Math.floor(Math.random() * types.length)];
        const mockUser = `User${Math.floor(Math.random() * 1000)}`;
        
        addNotification({
          type,
          title: 'New Activity!',
          message: `${mockUser} ${messages[type]}`,
          fromUserId: `user_${Math.random()}`,
          fromUserName: mockUser,
          snippetId: type !== 'follow' ? `snippet_${Math.random()}` : undefined,
          snippetTitle: type !== 'follow' ? 'Amazing Code Snippet' : undefined
        });
      }
    };

    // Set up mock interval (in real app, this would be a WebSocket connection)
    const interval = setInterval(mockNotifications, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [currentUser, realTimeUpdates, addNotification]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Utility function to create like notification
  const createLikeNotification = useCallback((
    snippetId: string,
    snippetTitle: string,
    fromUserId: string,
    fromUserName: string,
    fromUserAvatar?: string
  ) => {
    return addNotification({
      type: 'like',
      title: 'New Like!',
      message: `${fromUserName} liked your snippet "${snippetTitle}"`,
      snippetId,
      snippetTitle,
      fromUserId,
      fromUserName,
      fromUserAvatar,
      actionUrl: `/snippet/${snippetId}`
    });
  }, [addNotification]);

  // Utility function to create comment notification
  const createCommentNotification = useCallback((
    snippetId: string,
    snippetTitle: string,
    fromUserId: string,
    fromUserName: string,
    commentPreview: string,
    fromUserAvatar?: string
  ) => {
    return addNotification({
      type: 'comment',
      title: 'New Comment!',
      message: `${fromUserName} commented: "${commentPreview.slice(0, 50)}..."`,
      snippetId,
      snippetTitle,
      fromUserId,
      fromUserName,
      fromUserAvatar,
      actionUrl: `/snippet/${snippetId}#comments`
    });
  }, [addNotification]);

  return {
    notifications: notifications.slice(0, maxVisible),
    allNotifications: notifications,
    unreadCount,
    isVisible,
    
    // Actions
    addNotification,
    markAsRead,
    dismissNotification,
    markAllAsRead,
    clearAll,
    
    // Utility functions
    createLikeNotification,
    createCommentNotification,
    
    // Settings
    setIsVisible,
    requestNotificationPermission
  };
};
