import { Zap } from "lucide-react";

const NexusLogoLight = ({ size = "default" }: { size?: "default" | "large" }) => {
  const iconSize = size === "large" ? 36 : 24;
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <svg width={iconSize + 12} height={iconSize + 12} viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="hexGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFCF7" />
              <stop offset="100%" stopColor="#FFFCF7" />
            </linearGradient>
          </defs>
          <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" stroke="url(#hexGradLight)" strokeWidth="2" fill="none" />
          <path d="M24 10L38 18V30L24 38L10 30V18L24 10Z" stroke="url(#hexGradLight)" strokeWidth="1" fill="none" opacity="0.4" />
        </svg>
        <Zap
          size={iconSize * 0.6}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ color: "#FFFCF7" }}
          fill="#FFFCF7"
        />
      </div>
      <div className="flex flex-col">
        <span className={`font-heading font-bold leading-none ${size === "large" ? "text-2xl" : "text-lg"}`} style={{ color: "#FFFCF7" }}>
          NEXUS ERP
        </span>
        <span className={`leading-none ${size === "large" ? "text-sm mt-1" : "text-[10px] mt-0.5"}`} style={{ color: "#FFFCF7", opacity: 0.7 }}>
          PowerGrid Optimizer
        </span>
      </div>
    </div>
  );
};

export default NexusLogoLight;
