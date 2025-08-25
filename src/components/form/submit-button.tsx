import { useStore } from "@tanstack/react-form";
import { TbLoader2 } from "react-icons/tb";
import { useFormContext } from ".";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  children: React.ReactNode;
  loadingText?: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;       // Optional icon before text
  iconRight?: React.ReactNode;  // Optional icon after text
  className?: string;
};

const variantClasses = {
  primary:
    "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white",
  secondary:
    "bg-gray-200 text-gray-800 hover:bg-gray-300",
  danger:
    "bg-red-500 text-white hover:bg-red-600",
};

const sizeClasses = {
  sm: "px-3 py-2 text-sm rounded-md",
  md: "px-4 py-3 text-base rounded-lg",
  lg: "px-5 py-4 text-lg rounded-xl",
};

export const SubmitButton = ({
  children,
  loadingText = "Processing...",
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  className,
}: SubmitButtonProps) => {
  const form = useFormContext();

  const [isSubmitting, canSubmit] = useStore(form.store, (state: any) => [
    state.isSubmitting,
    state.canSubmit,
  ]);

  return (
    <Button
      type="submit"
      disabled={!canSubmit || isSubmitting}
      className={cn(
        "w-full font-semibold transition-all duration-300 transform focus:outline-none focus:ring-4 active:scale-95 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        isSubmitting && "bg-gray-400 cursor-not-allowed hover:none",
        className
      )}
    >
      {isSubmitting ? (
        <div className="flex items-center justify-center gap-2">
          <TbLoader2 className="w-5 h-5 animate-spin" />
          {loadingText}
        </div>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {icon}
          {children}
          {iconRight}
        </span>
      )}
    </Button>
  );
};
