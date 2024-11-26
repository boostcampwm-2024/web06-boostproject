import { toast } from 'sonner';
import { cn } from '@/lib/utils.ts';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

export const useToast = () => {
  const showToast = ({ message, type = 'info', duration = 2000 }: ToastOptions) => {
    const styles = {
      success: 'bg-green-500 hover:bg-green-600',
      error: 'bg-red-500 hover:bg-red-600',
      info: 'bg-gray-200 hover:bg-slate-300',
    };

    toast(message, {
      duration,
      className: cn(
        'text-white py-3 px-4 rounded-md shadow-lg font-medium text-sm border-transparent',
        styles[type]
      ),
    });
  };

  return {
    success: (message: string, duration?: number) =>
      showToast({ message, type: 'success', duration }),
    error: (message: string, duration?: number) => showToast({ message, type: 'error', duration }),
    info: (message: string, duration?: number) => showToast({ message, type: 'info', duration }),
  };
};
