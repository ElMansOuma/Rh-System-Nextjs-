// components/Notification.tsx
import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  type: NotificationType;
  message: string;
  isVisible: boolean;
  onClose: () => void;
}
export const Notification: React.FC<NotificationProps> = ({ type, message, isVisible, onClose }) => {
  // Auto-close after 5 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/50 dark:border-green-500 dark:text-green-200';
      case 'error':
        return 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/50 dark:border-red-500 dark:text-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/50 dark:border-blue-500 dark:text-blue-200';
      default:
        return 'bg-gray-50 border-gray-500 text-gray-700 dark:bg-gray-800 dark:border-gray-500 dark:text-gray-200';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
      <div className={`flex items-center p-4 rounded-lg shadow-lg border-l-4 ${getTypeStyles()} min-w-[320px] max-w-md`}>
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-grow">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-3 flex-shrink-0 hover:bg-black/5 dark:hover:bg-white/10 p-1 rounded-full transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};