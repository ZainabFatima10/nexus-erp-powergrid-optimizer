const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Health check
export interface HealthStatus {
  status: string;
  model_loaded: boolean;
}

export const checkHealth = () => apiFetch<HealthStatus>("/health");

// Dashboard endpoints
export interface SalesSummary {
  total_records: number;
  total_demand: number;
  avg_price: number;
  total_units_sold: number;
  total_promotions: number;
}

export interface CategorySales {
  category: string;
  total_demand: number;
}

export interface RegionSales {
  region: string;
  total_demand: number;
}

export interface SalesTrend {
  period: string;
  total_demand: number;
}

export interface InventoryStatus {
  category: string;
  avg_inventory: number;
  min_inventory: number;
  max_inventory: number;
}

export const getSalesSummary = () => apiFetch<SalesSummary>("/sales/summary");
export const getSalesByCategory = () => apiFetch<CategorySales[]>("/sales/by-category");
export const getSalesByRegion = () => apiFetch<RegionSales[]>("/sales/by-region");
export const getSalesTrend = (groupBy: string = "month") =>
  apiFetch<SalesTrend[]>(`/sales/trend?group_by=${groupBy}`);
export const getInventoryStatus = () => apiFetch<InventoryStatus[]>("/inventory/status");

// Filter options for prediction form
export interface FilterOptions {
  categories: string[];
  regions: string[];
  weather_conditions: string[];
  seasonality: string[];
  store_ids: (string | number)[];
  product_ids: (string | number)[];
}

export const getFilterOptions = () => apiFetch<FilterOptions>("/filters/options");

// Demand prediction
export interface PredictionInput {
  date: string;
  store_id: string | number;
  product_id: string | number;
  category: string;
  region: string;
  inventory_level: number;
  units_sold: number;
  units_ordered: number;
  price: number;
  discount: number;
  weather_condition: string;
  promotion: number;
  competitor_pricing: number;
  seasonality: string;
  epidemic: number;
}

export interface PredictionResult {
  predicted_demand: number;
}

export const predictDemand = (input: PredictionInput) =>
  apiFetch<PredictionResult>("/predict", {
    method: "POST",
    body: JSON.stringify(input),
  });
