import { NOTIFICATION_CONSTANTS } from "@/utils/constant";
import React, { useState } from "react";
import { Toaster as Sonner, toast } from "sonner";
import type { ToasterProps } from "sonner";


type ToastType = "default" | "success" | "error" | "info" | "warning" | "action" | "promise";

interface ShowToastOptions {
  description?: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

// Global showToast function
export const showToast = (type: ToastType, message: string, options: ShowToastOptions = {}) => {
  const { description, duration = 3000, actionLabel, onAction } = options;

  switch (type) {
    case NOTIFICATION_CONSTANTS.SUCCESS:
      toast.success(message, { description, duration });
      break;
    case NOTIFICATION_CONSTANTS.ERROR:
      toast.error(message, { description, duration });
      break;
    case NOTIFICATION_CONSTANTS.INFO:
      toast.info(message, { description, duration });
      break;
    case NOTIFICATION_CONSTANTS.WARNING:
      toast.warning(message, { description, duration });
      break;
    case NOTIFICATION_CONSTANTS.ACTION:
      toast(message, {
        description,
        duration,
        action: actionLabel ? { label: actionLabel, onClick: onAction } : undefined,
      });
      break;
    default:
      toast(message, { description, duration });
      break;
  }
};

// Promise-based toast helper
export const showPromiseToast = async <T,>(
  promise: Promise<T>,
  messages: { loading: string; success: (data: T) => string; error: (err: any) => string },
  duration: number = 3000
) => {
  return toast.promise(promise, {
    loading: messages.loading,
    success: (data) => messages.success(data),
    error: (err) => messages.error(err),
    duration,
  });
};

// ToastProvider component
export const ToastProvider: React.FC<ToasterProps> = (props) => {
  // Optional theme support
  const [theme, setTheme] = useState<ToasterProps["theme"]>("light");

  return (
    <Sonner
      theme={theme}
      position="top-center"
      closeButton
      richColors
      expand={false}
      style={
        {
          "--normal-bg": "#fff",
          "--normal-text": "#111",
          "--normal-border": "#ccc",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};
