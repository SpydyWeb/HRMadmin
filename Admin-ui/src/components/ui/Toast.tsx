import React from "react";
import  { ToastContainer, toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ToastType = "success" | "error" | "info" | "warning";



export const showToast = (type: ToastType, message: string, options: ToastOptions = {}) => {
  const mergedOptions = {  ...options };

  switch (type) {
    case "success":
      toast.success(message, mergedOptions);
      break;
    case "error":
      toast.error(message, mergedOptions);
      break;
    case "info":
      toast.info(message, mergedOptions);
      break;
    case "warning":
      toast.warning(message, mergedOptions);
      break;
    default:
      toast(message, mergedOptions);
  }
};

export const ToastProvider: React.FC = () => {
  return (
    <ToastContainer
    position='bottom-right'
      autoClose={3000}          // Ensures auto-close
      hideProgressBar={true}    // Matches your default
      closeOnClick
      pauseOnHover
      draggable
      progressClassName="bg-blue-500"
    />
  );
};
