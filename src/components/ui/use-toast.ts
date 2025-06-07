import { useState } from "react";

interface ToastProps {
  title: string;
  description: string;
  variant?: "default" | "destructive";
}

interface ToastState extends ToastProps {
  id: number;
  visible: boolean;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const toast = (props: ToastProps) => {
    const id = Date.now();
    const newToast: ToastState = {
      ...props,
      id,
      visible: true,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, visible: false } : t
        )
      );

      // Remove from state after animation
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 5000);
  };

  return {
    toast,
    toasts,
  };
} 