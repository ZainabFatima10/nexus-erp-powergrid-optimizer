import { useEffect, useState } from "react";
import { getFilterOptions, predictDemand, FilterOptions, PredictionRequest } from "@/services/api";
import { Loader2, Brain, TrendingUp } from "lucide-react";
import HealthBanner from "@/components/HealthBanner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const InventoryPrediction = () => {
  const [options, setOptions] = useState<FilterOptions | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date>();

  const [form, setForm] = useState({
    Store_ID: "",
    Product_ID: "",
    Category: "",
    Region: "",
    Inventory_Level: "",
    Units_Sold: "",
    Units_Ordered: "",
    Price: "",
    Discount: "",
    Weather_Condition: "",
    Promotion: "0",
    Competitor_Pricing: "",
    Seasonality: "",
    Epidemic: "0",
  });

  useEffect(() => {
    getFilterOptions()
      .then(setOptions)
      .catch((err) => setError(err.message))
      .finally(() => setOptionsLoading(false));
  }, []);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) { setError("Please select a date"); return; }
    setSubmitting(true);
    setError(null);
    setResult(null);

    const payload: PredictionRequest = {
      Date: format(date, "yyyy-MM-dd"),
      Store_ID: form.Store_ID || undefined,
      Product_ID: form.Product_ID || undefined,
      Category: form.Category,
      Region: form.Region,
      Inventory_Level: Number(form.Inventory_Level),
      Units_Sold: Number(form.Units_Sold),
      Units_Ordered: Number(form.Units_Ordered),
      Price: Number(form.Price),
      Discount: Number(form.Discount),
      Weather_Condition: form.Weather_Condition,
      Promotion: Number(form.Promotion),
      Competitor_Pricing: Number(form.Competitor_Pricing),
      Seasonality: form.Seasonality,
      Epidemic: Number(form.Epidemic),
    };

    try {
      const res = await predictDemand(payload);
      setResult(res.predicted_demand);
    } catch (err: any) {
      setError(err.message || "Prediction failed");
    } finally {
      setSubmitting(false);
    }
  };

  const SelectField = ({ label, field, items }: { label: string; field: string; items: string[] }) => (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-1.5">{label}</label>
      <select
        required
        value={form[field as keyof typeof form]}
        onChange={(e) => updateField(field, e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">Select {label}</option>
        {items.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
    </div>
  );

  const NumberField = ({ label, field, step, min, max }: { label: string; field: string; step?: string; min?: string; max?: string }) => (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-1.5">{label}</label>
      <input
        type="number"
        required
        step={step || "1"}
        min={min}
        max={max}
        value={form[field as keyof typeof form]}
        onChange={(e) => updateField(field, e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
    </div>
  );

  const ToggleField = ({ label, field }: { label: string; field: string }) => (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-1.5">{label}</label>
      <select
        value={form[field as keyof typeof form]}
        onChange={(e) => updateField(field, e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="0">No</option>
        <option value="1">Yes</option>
      </select>
    </div>
  );

  if (optionsLoading) {
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
          <h1 className="text-2xl font-heading font-bold">Inventory Prediction</h1>
          <p className="text-muted-foreground text-sm mt-1">AI-powered demand forecasting using your ML model.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Brain size={14} className="text-success" />
          <span>ML Model</span>
        </div>
      </div>

      {/* Result Card */}
      {result !== null && (
        <div className="glass-card p-6 border-accent-cyan glow-cyan animate-slide-up">
          <div className="flex items-center gap-3">
            <TrendingUp size={28} className="text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Predicted Demand</p>
              <p className="text-4xl font-heading font-bold">{result.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="glass-card p-4 bg-destructive/5 border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Prediction Form */}
      <form onSubmit={handleSubmit} className="glass-card p-6">
        <h2 className="font-heading font-semibold text-lg mb-5">Prediction Parameters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-left flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/50",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon size={16} />
                  {date ? format(date, "PPP") : "Select date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          {options && (
            <>
              <SelectField label="Store ID" field="Store_ID" items={options.store_ids} />
              <SelectField label="Product ID" field="Product_ID" items={options.product_ids} />
              <SelectField label="Category" field="Category" items={options.categories} />
              <SelectField label="Region" field="Region" items={options.regions} />
              <NumberField label="Inventory Level" field="Inventory_Level" min="0" />
              <NumberField label="Units Sold" field="Units_Sold" min="0" />
              <NumberField label="Units Ordered" field="Units_Ordered" min="0" />
              <NumberField label="Price" field="Price" step="0.01" min="0" />
              <NumberField label="Discount (%)" field="Discount" step="0.1" min="0" max="100" />
              <SelectField label="Weather Condition" field="Weather_Condition" items={options.weather_conditions} />
              <ToggleField label="Promotion" field="Promotion" />
              <NumberField label="Competitor Pricing" field="Competitor_Pricing" step="0.01" min="0" />
              <SelectField label="Seasonality" field="Seasonality" items={options.seasonalities} />
              <ToggleField label="Epidemic" field="Epidemic" />
            </>
          )}
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 font-semibold btn-navy disabled:opacity-50"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
            {submitting ? "Predicting..." : "Predict Demand"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryPrediction;
