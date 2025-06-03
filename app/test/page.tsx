"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  CheckCircle,
  Spinner,
  Warning,
  X,
} from "@phosphor-icons/react";
import {
  Circle,
  Clock,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import React from "react";

// Core status configurations for common use cases
export const statusConfig = {
  status: {
    PENDING: {
      variant: "yellow",
      icon: <Clock size={14} />,
      label: "Pending",
      color: "#DEA82B",
    },
    IN_PROGRESS: {
      variant: "lightBlue",
      icon: <Spinner className="animate-spin" size={14} />,
      label: "In Progress",
      color: "#24A8EB",
    },
    COMPLETED: {
      variant: "green",
      icon: <Check size={14} />,
      label: "Completed",
      color: "#22C55E",
    },
    FAILED: {
      variant: "red",
      icon: <XCircle size={14} />,
      label: "Failed",
      color: "#EF4444",
    },
    ACTIVE: {
      variant: "green",
      icon: <CheckCircle size={14} />,
      label: "Active",
      color: "#22C55E",
    },
    INACTIVE: {
      variant: "gray",
      icon: <Circle size={14} />,
      label: "Inactive",
      color: "#6B7280",
    },
    WARNING: {
      variant: "orange",
      icon: <Warning size={14} />,
      label: "Warning",
      color: "#F97316",
    },
  },
  priority: {
    HIGH: {
      variant: "red",
      icon: null,
      label: "High Priority",
      color: "#EF4444",
    },
    MEDIUM: {
      variant: "yellow",
      icon: null,
      label: "Medium Priority",
      color: "#DEA82B",
    },
    LOW: {
      variant: "green",
      icon: null,
      label: "Low Priority",
      color: "#22C55E",
    },
  },
  type: {
    URGENT: {
      variant: "red",
      icon: null,
      label: "Urgent",
      color: "#EF4444",
    },
    NORMAL: {
      variant: "lightBlue",
      icon: null,
      label: "Normal",
      color: "#24A8EB",
    },
    INFO: {
      variant: "darkPurple",
      icon: null,
      label: "Info",
      color: "#9333EA",
    },
  },
} as const;

// Pill variants using class-variance-authority
export const pillVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[7px] text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-none bg-gray-100 text-gray-600 hover:bg-gray-100 ring-gray-500/20 px-2 py-2",
        yellow:
          "border-none bg-[#FDF9ED] text-[#DEA82B] hover:bg-yellow-100 ring-yellow-500/20 px-2 py-2",
        orange:
          "border-none bg-orange-50 text-orange-600 hover:bg-orange-100 ring-orange-500/20 px-2 py-2",
        gray: 
          "border-none bg-[#F0F9EB] text-[#838580] hover:bg-gray-100 ring-gray-500/20 px-2 py-2",
        green:
          "border-none bg-green-50 text-green-600 hover:bg-green-100 ring-green-500/20 px-2 py-2",
        red: 
          "border-none bg-red-50 text-red-600 hover:bg-red-100 ring-red-500/20 px-2 py-2",
        lightBlue:
          "border-none bg-[#EBF9FE] text-[#24A9EB] hover:bg-blue-100/70 ring-blue-400/20 px-2 py-2",
        darkPurple:
          "border-none bg-purple-50 text-purple-600 hover:bg-purple-100 ring-purple-500/20 px-2 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const DEFAULT_CONFIG = {
  variant: "default" as const,
  icon: <Circle size={14} />,
  label: "Unknown",
  color: "#6B7280",
};

// Tooltip wrapper component
const TooltipWrapper = React.memo<{
  tooltip?: string;
  children: React.ReactNode;
}>(({ tooltip, children }) => {
  if (!tooltip) return <>{children}</>;
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

TooltipWrapper.displayName = "TooltipWrapper";

// Main Pill component interface
interface PillProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pillVariants> {
  category?: keyof typeof statusConfig;
  value: string;
  showAvatar?: boolean;
  avatarUrl?: string;
  icon?: React.ReactNode;
  tooltip?: string;
}

export function Pill({
  className,
  category = "status",
  value,
  showAvatar,
  avatarUrl,
  icon,
  tooltip,
  ...props
}: PillProps) {
  // Get configuration based on category and value
  const config = React.useMemo(() => {
    if (!category || !statusConfig[category]) {
      return DEFAULT_CONFIG;
    }

    const categoryConfig = statusConfig[category];
    const normalizedValue = value.toUpperCase().replace(/\s+/g, '_');
    
    return categoryConfig[normalizedValue as keyof typeof categoryConfig] || DEFAULT_CONFIG;
  }, [category, value]);

  return (
    <TooltipWrapper tooltip={tooltip}>
      <div
        className={cn(
          pillVariants({ variant: config.variant }),
          className,
        )}
        {...props}
      >
        {showAvatar && (
          <Avatar className="h-4 w-4">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={value} />
            ) : (
              <AvatarFallback className="text-[10px]">
                {value.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        )}
        
        {icon || config.icon}
        
        <span className="font-semibold">
          {config.label}
        </span>
      </div>
    </TooltipWrapper>
  );
}

Pill.displayName = "Pill";

// Showcase component
export default function PillShowcase() {
  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Status Pill Components</h1>
          <p className="text-gray-600">A collection of status indicators for your UI</p>
        </div>

        {/* Status Pills */}
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">General Status</h2>
            <div className="flex flex-wrap gap-3">
              <Pill category="status" value="pending" tooltip="Task is waiting to be processed" />
              <Pill category="status" value="in_progress" tooltip="Task is currently being processed" />
              <Pill category="status" value="completed" tooltip="Task has been completed successfully" />
              <Pill category="status" value="failed" tooltip="Task has failed to complete" />
              <Pill category="status" value="active" tooltip="Item is currently active" />
              <Pill category="status" value="inactive" tooltip="Item is currently inactive" />
              <Pill category="status" value="warning" tooltip="Attention required" />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Priority Levels</h2>
            <div className="flex flex-wrap gap-3">
              <Pill category="priority" value="high" tooltip="High priority item" />
              <Pill category="priority" value="medium" tooltip="Medium priority item" />
              <Pill category="priority" value="low" tooltip="Low priority item" />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Types</h2>
            <div className="flex flex-wrap gap-3">
              <Pill category="type" value="urgent" tooltip="Requires immediate attention" />
              <Pill category="type" value="normal" tooltip="Standard processing" />
              <Pill category="type" value="info" tooltip="Informational item" />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">With Avatars</h2>
            <div className="flex flex-wrap gap-3">
              <Pill 
                category="status" 
                value="active" 
                showAvatar 
                tooltip="User is currently active" 
              />
              <Pill 
                category="status" 
                value="pending" 
                showAvatar 
                avatarUrl="https://github.com/shadcn.png"
                tooltip="User has pending tasks" 
              />
              <Pill 
                category="priority" 
                value="high" 
                showAvatar 
                tooltip="High priority user" 
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Custom Icons</h2>
            <div className="flex flex-wrap gap-3">
              <Pill 
                category="status" 
                value="completed" 
                icon={<CheckCircle size={14} />}
                tooltip="Task completed with custom icon" 
              />
              <Pill 
                category="status" 
                value="warning" 
                icon={<Warning size={14} />}
                tooltip="Warning with custom icon" 
              />
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
