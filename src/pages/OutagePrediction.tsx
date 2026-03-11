import { Cloud } from "lucide-react";
import HealthBanner from "@/components/HealthBanner";

const OutagePrediction = () => {
  return (
    <div className="space-y-6 animate-slide-up">
      <HealthBanner />
      <div>
        <h1 className="text-2xl font-heading font-bold">Outage Prediction</h1>
        <p className="text-muted-foreground text-sm mt-1">AI-powered outage forecasting.</p>
      </div>

      <div className="glass-card p-12 text-center glow-cyan">
        <Cloud size={48} className="mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-heading font-bold mb-2">Coming Soon</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Outage prediction model is being trained. Check back soon.
        </p>
      </div>
    </div>
  );
};

export default OutagePrediction;
