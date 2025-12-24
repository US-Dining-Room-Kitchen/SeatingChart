import React, { useState, useEffect } from 'react';
import type { NotificationType } from '../../types';

interface NotificationProps {
  message: string;
  type?: NotificationType;
  onDismiss: () => void;
}

/**
 * Notification component that displays a temporary message
 * Automatically dismisses after 5 seconds with slide animations
 */
export const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type = 'info', 
  onDismiss 
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (message) {
      setIsExiting(false);
      const timer = setTimeout(() => {
        setIsExiting(true);
      }, 4500);
      const removeTimer = setTimeout(onDismiss, 5000);
      return () => {
        clearTimeout(timer);
        clearTimeout(removeTimer);
      };
    }
  }, [message, onDismiss]);

  if (!message) return null;

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  const animationClass = isExiting ? 'animate-slide-out-up' : 'animate-slide-in-down';

  return (
    <div 
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg text-white font-semibold ${bgColor} ${animationClass}`}
    >
      {message}
    </div>
  );
};
