import { cn } from "@/lib/utils";

interface AuthorityBadgeProps {
  level: "resolve" | "judge" | "escalate" | string;
  className?: string;
  showIcon?: boolean;
}

export default function AuthorityBadge({ level, className, showIcon = false }: AuthorityBadgeProps) {
  const getLabel = () => {
    switch (level) {
      case "resolve": return "Handle it";
      case "judge": return "Your call";
      case "escalate": return "Escalate";
      default: return level;
    }
  };

  const getBadgeClass = () => {
    switch (level) {
      case "resolve":
        return "bg-[var(--ok-soft)] text-[var(--ok)]";
      case "judge":
        return "bg-[var(--warn-soft)] text-[var(--warn)]";
      case "escalate":
        return "bg-[var(--stop-soft)] text-[var(--stop)]";
      default:
        return "bg-[var(--surface-2)] text-[var(--ink-3)]";
    }
  };

  return (
    <span className={cn(
      "font-display font-bold text-[9.5px] tracking-[0.1em] uppercase rounded-[4px] px-[7px] py-[3px] whitespace-nowrap inline-flex items-center gap-[6px]",
      getBadgeClass(),
      className
    )}>
      {showIcon && (
        <span className={cn(
          "w-[7px] h-[7px] rounded-full",
          level === "resolve" ? "bg-[var(--ok)]" : 
          level === "judge" ? "bg-[var(--warn)]" :
          level === "escalate" ? "bg-[var(--stop)]" : "bg-current opacity-65"
        )} />
      )}
      {getLabel()}
    </span>
  );
}
