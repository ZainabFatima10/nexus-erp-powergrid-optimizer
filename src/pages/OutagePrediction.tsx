import { useEffect, useState } from "react";
import { getOutageForecast, ForecastDay, ForecastResponse } from "@/services/api";
import { Loader2, Zap, CloudLightning, ShieldAlert, MapPin, CloudSun, CheckCircle2, XCircle } from "lucide-react";
import HealthBanner from "@/components/HealthBanner";
import { format } from "date-fns";

const riskColor: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  Low:    { bg: "bg-success/10",     text: "text-success",     border: "border-success/30",     glow: "shadow-success/10" },
  Medium: { bg: "bg-warning/10",     text: "text-warning",     border: "border-warning/30",     glow: "shadow-warning/10" },
  High:   { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30", glow: "shadow-destructive/10" },
};

const OutagePrediction = () => {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ForecastDay | null>(null);

  useEffect(() => {
    getOutageForecast()
      .then((res) => { setData(res); setSelected(null); })
      .catch(() => setError("Forecast unavailable"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <HealthBanner />

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Outage Prediction</h1>
          <p className="text-muted-foreground text-sm mt-1">AI-powered 7-day outage forecasting.</p>
        </div>
        {data && (
          <p className="text-xs text-muted-foreground">
            Last Updated: {format(new Date(data.generated_at), "PPpp")}
          </p>
        )}
      </div>

      {error && (
        <div className="glass-card p-6 text-center border-destructive/30">
          <XCircle size={36} className="mx-auto text-destructive mb-3" />
          <p className="text-destructive font-semibold">{error}</p>
        </div>
      )}

      {data && (
        <>
          {/* Weekly cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {data.forecast.map((day) => {
              const colors = riskColor[day.risk_level] || riskColor.Low;
              const isSelected = selected?.date === day.date;
              return (
                <button
                  key={day.date}
                  onClick={() => setSelected(isSelected ? null : day)}
                  className={`glass-card p-4 text-left transition-all hover:scale-[1.03] cursor-pointer ${
                    isSelected ? `ring-2 ring-primary shadow-lg ${colors.glow}` : ""
                  }`}
                >
                  <p className="text-xs text-muted-foreground font-medium">{day.day}</p>
                  <p className="text-[11px] text-muted-foreground">{format(new Date(day.date), "MMM d")}</p>

                  <p className="text-3xl font-heading font-bold mt-3 mb-2">
                    {day.outage_probability}<span className="text-base">%</span>
                  </p>

                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                    {day.risk_level}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Drill-down panel */}
          {selected && (
            <div className="glass-card p-6 animate-slide-up space-y-5">
              <div className="flex items-center gap-3">
                <CloudLightning size={24} className="text-primary" />
                <div>
                  <h2 className="font-heading font-bold text-lg">
                    {selected.day}, {format(new Date(selected.date), "MMMM d")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Demand: <span className="font-semibold text-foreground">{selected.demand_kwh.toLocaleString()} kWh</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Affected Zones */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <MapPin size={14} /> Affected Zones
                  </div>
                  {selected.affected_zones.length === 0 ? (
                    <p className="text-sm text-success">None</p>
                  ) : (
                    <ul className="space-y-1">
                      {selected.affected_zones.map((z) => (
                        <li key={z} className="text-sm flex items-center gap-1.5">
                          <ShieldAlert size={12} className="text-destructive" /> {z}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Weather Factors */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <CloudSun size={14} /> Weather Factors
                  </div>
                  <ul className="space-y-1">
                    {selected.weather_factors.map((w) => (
                      <li key={w} className="text-sm">{w}</li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Actions */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <CheckCircle2 size={14} /> Recommended Actions
                  </div>
                  <ul className="space-y-1">
                    {selected.recommended_actions.map((a) => (
                      <li key={a} className="text-sm flex items-center gap-1.5">
                        <Zap size={12} className="text-warning" /> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OutagePrediction;
