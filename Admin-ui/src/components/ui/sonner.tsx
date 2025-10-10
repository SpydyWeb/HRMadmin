import React, { useEffect, useState } from "react";
import { Toaster as Sonner, ToasterProps, toast } from "sonner";


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
    case "success":
      toast.success(message, { description, duration });
      break;
    case "error":
      toast.error(message, { description, duration });
      break;
    case "info":
      toast.info(message, { description, duration });
      break;
    case "warning":
      toast.warning(message, { description, duration });
      break;
    case "action":
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
  // use next-themes if desired
  // const { theme: nextTheme = "system" } = useTheme();
  // useEffect(() => setTheme(nextTheme as ToasterProps["theme"]), [nextTheme]);

  return (
    <Sonner
      theme={theme}
      position="bottom-right"
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
