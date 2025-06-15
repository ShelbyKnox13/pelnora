import { useLocation } from "wouter";
import { Button } from "./button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export const BackButton = ({ 
  to = "/dashboard", 
  label = "Back to Dashboard",
  className = ""
}: BackButtonProps) => {
  const [, navigate] = useLocation();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate(to)}
      className={`mb-6 ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};