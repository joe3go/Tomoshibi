// Tooltip component disabled to fix React hooks error
// This component was causing TooltipProvider React hooks error

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => children;
export const Tooltip = ({ children }: { children: React.ReactNode }) => children;
export const TooltipTrigger = ({ children }: { children: React.ReactNode }) => children;
export const TooltipContent = ({ children }: { children: React.ReactNode }) => null;
