import { useState } from "react";
import { outageForecast } from "@/data/mockData";
import { Brain, MapPin, CloudRain, Shield } from "lucide-react";

const OutagePrediction = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const riskColors: Record<string, string> = {
    Low: "bg-success/10 text-success border-success/30",
    Medium: "bg-warning/10 text-warning border-warning/30",
    High: "bg-destructive/10 text-destructive border-destructive/30",
  };

  const riskBarColors: Record<string, string> = {
    Low: "bg-success",
    Medium: "bg-warning",
    High: "bg-destructive",
  };

  const selected = selectedDay !== null ? outageForecast[selectedDay] : null;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Outage Prediction</h1>
          <p className="text-muted-foreground text-sm mt-1">AI-powered 7-day outage probability forecast.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Brain size={14} className="text-success" />
          <span>AI Model: <span className="text-success font-medium">Active</span></span>
          <span className="text-border">|</span>
          <span>Last Updated: Mar 4, 2026 08:00</span>
        </div>
      </div>

      {/* 7-day forecast cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {outageForecast.map((day, i) => (
          <button
            key={day.day}
            onClick={() => setSelectedDay(selectedDay === i ? null : i)}
            className={`glass-card p-4 text-center transition-all glow-cyan-hover cursor-pointer ${selectedDay === i ? "ring-2 ring-primary" : ""}`}
          >
            <p className="text-xs text-muted-foreground">{day.day}</p>
            <p className="text-xs text-muted-foreground mb-2">{day.date}</p>
            <p className="text-2xl font-heading font-bold">{day.probability}%</p>
            <div className="mt-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${riskColors[day.risk]}`}>{day.risk}</span>
            </div>
            {/* Mini bar */}
            <div className="mt-3 w-full h-1.5 rounded-full bg-muted/50">
              <div className={`h-full rounded-full ${riskBarColors[day.risk]} transition-all`} style={{ width: `${day.probability}%` }} />
            </div>
          </button>
        ))}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="glass-card p-6 animate-slide-up border-accent-violet">
          <h2 className="font-heading font-bold text-lg mb-4">
            {selected.day}, {selected.date} — Detail Report
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-primary" />
                <h3 className="text-sm font-semibold">Affected Grid Areas</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selected.areas.map((a) => (
                  <span key={a} className="text-xs px-2.5 py-1 rounded-md bg-muted/50 text-foreground font-mono">{a}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CloudRain size={16} className="text-warning" />
                <h3 className="text-sm font-semibold">Weather Factors</h3>
              </div>
              <ul className="space-y-1">
                {selected.weather.map((w) => (
                  <li key={w} className="text-xs text-muted-foreground">• {w}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-success" />
                <h3 className="text-sm font-semibold">Recommended Actions</h3>
              </div>
              <ul className="space-y-1">
                {selected.actions.map((a) => (
                  <li key={a} className="text-xs text-muted-foreground">• {a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutagePrediction;
