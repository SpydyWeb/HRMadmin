// components/ui/CustomButton.tsx
import React from "react";
import Button from "@mui/material/Button";
import { SxProps } from "@mui/system";

interface CommonButtonProps {
  label: string;
  variant?: "text" | "contained" | "outlined";
  color?: "primary" | "secondary" | "warning" | "info";
  onClick?: () => void;
  sx?: SxProps;
  startIcon?: React.ReactNode;
}

export const CommonButton: React.FC<CommonButtonProps> = ({
  label,
  variant = "contained",
  color = "primary",
  onClick,
  sx,
  startIcon,
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      onClick={onClick}
      startIcon={startIcon}
      sx={{
        borderRadius: "5rem",
        textTransform: "none",
        padding: "0.5rem 1rem",
        fontWeight: "bold",
        fontSize: "0.875rem",
        boxShadow: "none",
        ...sx,
      }}
    >
      {label}
    </Button>
  );
};
