import { useEffect, useState } from "react";
import { checkHealth } from "@/services/api";
import { AlertTriangle, XCircle } from "lucide-react";

const HealthBanner = () => {
  const [status, setStatus] = useState<"ok" | "model_not_loaded" | "unreachable" | "loading">("loading");

  useEffect(() => {
    checkHealth()
      .then((data) => {
        setStatus(data.model_loaded ? "ok" : "model_not_loaded");
      })
      .catch(() => {
        setStatus("unreachable");
      });
  }, []);

  if (status === "loading" || status === "ok") return null;

  if (status === "model_not_loaded") {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-warning/10 border border-warning/30 text-warning text-sm mb-4">
        <AlertTriangle size={18} />
        <span>⚠️ Prediction model is not loaded. Demand forecasting is unavailable.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm mb-4">
      <XCircle size={18} />
      <span>❌ Cannot reach backend. Make sure the API tunnel is running.</span>
    </div>
  );
};

export default HealthBanner;
