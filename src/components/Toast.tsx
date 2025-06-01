import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast = ({ id, message, type, duration = 3000, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-vault-accent';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-vault-accent';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      className={`flex items-center justify-between p-4 mb-3 rounded-lg shadow-lg ${getBgColor()} text-black backdrop-blur-md`}
    >
      <p className="font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="ml-4 text-black/70 hover:text-black transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export interface ToastContextProps {
  toasts: ToastProps[];
  addToast: (message: string, type: ToastProps['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (message: string, type: ToastProps['type'] = 'info', duration = 3000) => {
    const id = `toast-${Date.now()}`;
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration, onClose: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Expose the toast methods globally
  useEffect(() => {
    window.showToast = addToast;
    
    return () => {
      delete window.showToast;
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[100] max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Add to global window type
declare global {
  interface Window {
    showToast?: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
  }
}
