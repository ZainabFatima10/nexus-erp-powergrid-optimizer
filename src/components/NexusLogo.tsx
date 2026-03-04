import { Zap } from "lucide-react";

const NexusLogo = ({ size = "default" }: { size?: "default" | "large" }) => {
  const iconSize = size === "large" ? 36 : 24;
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative">
        {/* Hexagon background */}
        <svg width={iconSize + 12} height={iconSize + 12} viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(130 15% 45%)" />
              <stop offset="100%" stopColor="hsl(133 25% 55%)" />
            </linearGradient>
          </defs>
          <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" stroke="url(#hexGrad)" strokeWidth="2" fill="none" />
          <path d="M24 10L38 18V30L24 38L10 30V18L24 10Z" stroke="url(#hexGrad)" strokeWidth="1" fill="none" opacity="0.4" />
        </svg>
        <Zap
          size={iconSize * 0.6}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ color: "hsl(130 15% 45%)" }}
          fill="hsl(130 15% 45%)"
        />
      </div>
      <div className="flex flex-col">
        <span className={`font-heading font-bold gradient-text leading-none ${size === "large" ? "text-2xl" : "text-lg"}`}>
          NEXUS ERP
        </span>
        <span className={`text-muted-foreground leading-none ${size === "large" ? "text-sm mt-1" : "text-[10px] mt-0.5"}`}>
          PowerGrid Optimizer
        </span>
      </div>
    </div>
  );
};

export default NexusLogo;
