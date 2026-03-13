// src/services/api.ts
// ─────────────────────────────────────────────────────────────────────────────
// NEXUS ERP — API Service
// Replace API_BASE_URL with your live ngrok/localtunnel URL each session,
// or set VITE_API_URL in your Lovable project environment variables.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://phenomenon-emotional-heaven-limiting.trycloudflare.com";

// ─── Generic fetch wrapper ────────────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(error.detail || `API error ${res.status}`);
    }
    return res.json() as Promise<T>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PredictionRequest {
    Date: string;
    Store_ID?: string;
    Product_ID?: string;
    Category: string;
    Region: string;
    Inventory_Level: number;
    Units_Sold: number;
    Units_Ordered: number;
    Price: number;
    Discount: number;
    Weather_Condition: string;
    Promotion: number;       // 0 or 1
    Competitor_Pricing: number;
    Seasonality: string;
    Epidemic: number;        // 0 or 1
}

export interface PredictionResponse {
    predicted_demand: number;
    status: string;
}

export interface SalesSummary {
    total_records: number;
    total_demand: number;
    avg_price: number;
    total_units_sold: number;
    total_promotions: number;
}

export interface CategoryData {
    Category: string;
    total_demand: number;
    total_units_sold: number;
    avg_price: number;
}

export interface RegionData {
    Region: string;
    total_demand: number;
    total_units_sold: number;
    record_count: number;
}

export interface TrendData {
    period: string;
    total_demand: number;
    total_units_sold: number;
    avg_price: number;
}

export interface InventoryStatus {
    Category: string;
    avg_inventory: number;
    min_inventory: number;
    max_inventory: number;
    avg_units_ordered: number;
}

export interface FilterOptions {
    categories: string[];
    regions: string[];
    weather_conditions: string[];
    seasonalities: string[];
    store_ids: string[];
    product_ids: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** Health check — use on app load to verify backend is reachable */
export const checkHealth = () =>
    apiFetch<{ status: string; model_loaded: boolean; db_connected: boolean }>("/health");

/** Run demand prediction with the ML model */
export const predictDemand = (payload: PredictionRequest) =>
    apiFetch<PredictionResponse>("/predict", {
        method: "POST",
        body: JSON.stringify(payload),
    });

/** KPI summary cards */
export const getSalesSummary = () =>
    apiFetch<SalesSummary>("/sales/summary");

/** Demand & units sold by product category */
export const getSalesByCategory = () =>
    apiFetch<{ data: CategoryData[] }>("/sales/by-category");

/** Demand by region */
export const getSalesByRegion = () =>
    apiFetch<{ data: RegionData[] }>("/sales/by-region");

/**
 * Time-series demand trend
 * @param groupBy  "day" | "month" | "year"  (default: "month")
 */
export const getSalesTrend = (groupBy: "day" | "month" | "year" = "month") =>
    apiFetch<{ data: TrendData[]; group_by: string }>(`/sales/trend?group_by=${groupBy}`);

/** Inventory levels by category */
export const getInventoryStatus = () =>
    apiFetch<{ data: InventoryStatus[] }>("/sales/inventory-status");

/**
 * Raw sales records with optional filters
 * @param filters  { category?, region?, store_id?, limit?, offset? }
 */
export const getSalesRecords = (filters?: {
    category?: string;
    region?: string;
    store_id?: string;
    limit?: number;
    offset?: number;
}) => {
    const params = new URLSearchParams();
    if (filters?.category) params.set("category", filters.category);
    if (filters?.region) params.set("region", filters.region);
    if (filters?.store_id) params.set("store_id", filters.store_id);
    if (filters?.limit) params.set("limit", String(filters.limit));
    if (filters?.offset) params.set("offset", String(filters.offset));
    return apiFetch<{ data: Record<string, unknown>[]; count: number }>(
        `/sales?${params.toString()}`
    );
};

/** All valid dropdown values for the prediction form */
export const getFilterOptions = () =>
    apiFetch<FilterOptions>("/meta/options");

// ═══════════════════════════════════════════════════════════════════════════════
// OUTAGE / FORECAST
// ═══════════════════════════════════════════════════════════════════════════════

export interface ForecastDay {
    date: string;
    day: string;
    demand_kwh: number;
    outage_probability: number;
    risk_level: "Low" | "Medium" | "High";
    affected_zones: string[];
    weather_factors: string[];
    recommended_actions: string[];
}

export interface ForecastResponse {
    generated_at: string;
    forecast: ForecastDay[];
}

/** 7-day outage forecast */
export const getOutageForecast = () =>
    apiFetch<ForecastResponse>("/api/forecast");

/** Forecast for a specific date */
export const getForecastByDate = (date: string) =>
    apiFetch<ForecastDay>(`/api/forecast/${date}`);

// ═══════════════════════════════════════════════════════════════════════════════
// INVENTORY ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Inventory overview */
export const getInventoryOverview = () =>
    apiFetch<Record<string, unknown>>("/api/inventory/overview");

/** Current orders */
export const getCurrentOrders = () =>
    apiFetch<Record<string, unknown>>("/api/inventory/orders/current");

/** Order history */
export const getOrderHistory = () =>
    apiFetch<Record<string, unknown>>("/api/inventory/orders/history");

/** Check inventory for an item */
export const checkInventory = (payload: Record<string, unknown>) =>
    apiFetch<Record<string, unknown>>("/api/inventory/check", {
        method: "POST",
        body: JSON.stringify(payload),
    });

/** Reorder an item */
export const reorderItem = (itemId: string) =>
    apiFetch<Record<string, unknown>>(`/api/inventory/reorder/${itemId}`, {
        method: "POST",
    });
