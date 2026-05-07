// ─────────────────────────────────────────────────────────────────────────────
// NEXUS ERP — API Service
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE_URL = "https://shakable-arbitrary-strategic.ngrok-free.dev";

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
// CORE TYPES (Module 2 spec)
// ═══════════════════════════════════════════════════════════════════════════════
export interface InventoryItem {
  item_id: string;
  name: string;
  category: string;
  unit: string;
  min_threshold: number;
  current_stock: number;
  daily_consumption: number;
  vendor: string;
  vendor_email: string;
  status: "OK" | "Low" | "Critical";
  critical_threshold: number;
  days_until_reorder: number;
  reorder_quantity: number;
  last_updated: string;
  // legacy/optional fields used by existing UI components
  vendor_name?: string;
  days_until_critical?: number;
  stock_pct?: number;
}

export interface Order {
  order_id: string;
  item_id: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  vendor: string;
  vendor_email: string;
  trigger_type: string;
  stage: string;
  contract_status: string;
  email_sent: boolean;
  created_at: string;
  expected_delivery: string;
  accepted_by: string | null;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  order_id: string;
  item_name: string;
  category: string;
}

export interface DashboardStats {
  inventory: {
    total: number;
    ok: number;
    low: number;
    critical: number;
    by_category: {
      Generation: { total: number; ok: number; low: number; critical: number };
      Infrastructure: { total: number; ok: number; low: number; critical: number };
      Operational: { total: number; ok: number; low: number; critical: number };
    };
  };
  orders: { total: number; pending: number; placed: number };
  notifications: { unread: number };
  models: { outage_accuracy: number; inventory_accuracy: number };
}

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
  Promotion: number;
  Competitor_Pricing: number;
  Seasonality: string;
  Epidemic: number;
}

export interface PredictionResponse {
  predicted_demand: number;
  status: string;
  reorder_needed: boolean;
  reorder_quantity: number;
  trigger_type: string;
  message: string;
}

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

// ═══════════════════════════════════════════════════════════════════════════════
// CORE ENDPOINTS (new spec)
// ═══════════════════════════════════════════════════════════════════════════════
export const getDashboard = () =>
  apiFetch<DashboardStats>("/api/dashboard");

export const getInventoryOverview = (category?: string) =>
  apiFetch<{ summary: { total_items: number; ok: number; low: number; critical: number }; items: InventoryItem[] }>(
    `/api/inventory/overview${category ? `?category=${category}` : ""}`
  );

export const getCurrentOrders = (category?: string) =>
  apiFetch<{ count: number; orders: Order[] }>(
    `/api/inventory/orders/current${category ? `?category=${category}` : ""}`
  );

export const getPastOrders = (category?: string) =>
  apiFetch<{ count: number; orders: Order[] }>(
    `/api/inventory/orders/history${category ? `?category=${category}` : ""}`
  );

export const triggerInventoryCheck = () =>
  apiFetch<{ message: string; order_ids: string[] }>(
    "/api/inventory/check",
    { method: "POST" }
  );

export const acceptOrder = (order_id: string, officer_name: string) =>
  apiFetch<{ message: string }>(`/api/inventory/orders/${order_id}/accept`, {
    method: "POST",
    body: JSON.stringify({ officer_name }),
  });

export const manualReorder = (item_id: string, quantity: number) =>
  apiFetch<{ message: string; order_id: string }>(
    `/api/inventory/reorder/${item_id}`,
    { method: "POST", body: JSON.stringify({ quantity }) }
  );

export const getNotifications = (unread_only = false) =>
  apiFetch<{ count: number; notifications: Notification[] }>(
    `/api/notifications${unread_only ? "?unread_only=true" : ""}`
  );

export const markNotificationRead = (id: number) =>
  apiFetch<{ message: string }>(`/api/notifications/${id}/read`, { method: "POST" });

export const predictDemand = (payload: PredictionRequest) =>
  apiFetch<PredictionResponse>("/api/predict", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getOutageForecast = () =>
  apiFetch<ForecastResponse>("/api/forecast");

export const checkHealth = () =>
  apiFetch<{ status: string }>("/health");

export const getFilterOptions = () =>
  Promise.resolve<FilterOptions>({
    categories: [
      "Gas Turbine Blades", "Generator Rotor Coils", "Diesel Fuel Stock",
      "Cooling Tower Fills", "Steam Boiler Tubes", "Transformer Oil",
      "Generator Brushes", "Fuel Filters", "Distribution Transformers",
      "Circuit Breakers", "Power Cables", "Transmission Towers",
      "Insulators", "Surge Arresters", "Underground Cable Joints",
      "ACSR Conductors", "Smart Meters", "Relay Protection Units",
      "Copper Conductors", "Safety Helmets", "Insulated Gloves",
      "Multimeters", "Cable Ties and Conduits", "Earthing Kits",
    ],
    regions: ["Islamabad", "Lahore", "Karachi", "Peshawar", "Quetta"],
    weather_conditions: ["Normal", "Heatwave", "Flood", "Storm", "Cold Wave"],
    seasonalities: ["Summer", "Winter", "Spring", "Autumn"],
    store_ids: ["S001", "S002", "S003"],
    product_ids: ["P001", "P002", "P003"],
  });

export interface FilterOptions {
  store_ids: string[];
  product_ids: string[];
  categories: string[];
  regions: string[];
  weather_conditions: string[];
  seasonalities: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEGACY / COMPAT EXPORTS (kept so untouched pages still build)
// ═══════════════════════════════════════════════════════════════════════════════

// Auth (used by AuthContext)
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}
export const loginUser = (email: string, password: string) =>
  apiFetch<{ user: AuthUser; token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
export const signupUser = (name: string, email: string, password: string, role: string) =>
  apiFetch<{ message: string; user_id: string }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });

// Procurement / Order detail modal compat types
export interface TrackingEvent {
  ts: string; status: string; location: string; notes: string;
}
export interface ContractAuditEntry {
  id: string; action: string; tx_hash: string; block_number: number;
  payload: Record<string, unknown>; performed_at: string;
}
export interface DeliveryCheckin {
  id: string; order_id: string; checkin_at: string; location: string;
  status: string; quantity_received: number;
  condition: "Good" | "Partial" | "Damaged"; notes: string; is_final: boolean;
}
export interface ProcurementOrder {
  id: string; order_code: string; item_id: string; item_name: string;
  unit: string; vendor_name: string; vendor_email: string; quantity: number;
  unit_price: number | null; total_price: number | null;
  trigger_type: "VEMA-Triggered" | "Auto-Generated" | "Manual";
  stage: string; vendor_email_sent: boolean; vendor_confirmed: boolean;
  contract_status: "Pending" | "Signed" | "Executed" | "Rejected";
  contract_hash: string | null; expected_delivery: string;
  actual_delivery: string | null; delivery_confirmed: boolean;
  delivery_condition: string | null; tracking_events: TrackingEvent[];
  smart_contract_data: Record<string, unknown> | null;
  created_at: string; updated_at: string;
}
export interface OrderDetailResponse {
  order: ProcurementOrder; checkins: DeliveryCheckin[]; audit: ContractAuditEntry[];
}
export const getOrder = (orderId: string) =>
  apiFetch<OrderDetailResponse>(`/api/procurement/orders/${orderId}`);
export const signContract = (orderId: string, signatory: string) =>
  apiFetch(`/api/procurement/sign/${orderId}`, {
    method: "POST",
    body: JSON.stringify({ signatory, role: "operator" }),
  });
export const submitDeliveryCheckin = (
  orderId: string,
  payload: {
    location?: string; status: string; quantity_received: number;
    condition: "Good" | "Partial" | "Damaged"; notes?: string;
    is_final: boolean; checked_by?: string;
  }
) =>
  apiFetch<{ checkin_id: string; contract_executed: boolean; execution_hash: string | null }>(
    `/api/procurement/checkin/${orderId}`,
    { method: "POST", body: JSON.stringify(payload) }
  );

export const runInventoryCheck = triggerInventoryCheck;
export const markAllNotificationsRead = (_userId?: string) =>
  apiFetch<{ message: string }>("/api/notifications/mark-all-read", { method: "POST" }).catch(() => ({ message: "ok" }));
export const listOrders = (_params?: { stage?: string; item_id?: string; limit?: number; offset?: number }) =>
  getCurrentOrders().then((r) => ({ total: r.count, orders: [] as ProcurementOrder[] }));

// Dashboard analytics legacy (used by old Dashboard page if still present)
export interface SalesSummary { total_records: number; total_demand: number; avg_price: number; total_units_sold: number; total_promotions: number; }
export interface CategoryData { Category: string; total_demand: number; total_units_sold: number; avg_price: number; }
export interface RegionData { Region: string; total_demand: number; total_units_sold: number; record_count: number; }
export interface TrendData { period: string; total_demand: number; total_units_sold: number; avg_price: number; }
export interface InventoryStatus { Category: string; avg_inventory: number; min_inventory: number; max_inventory: number; avg_units_ordered: number; }

export const getSalesSummary = () => apiFetch<SalesSummary>("/sales/summary");
export const getSalesByCategory = () => apiFetch<{ data: CategoryData[] }>("/sales/by-category");
export const getSalesByRegion = () => apiFetch<{ data: RegionData[] }>("/sales/by-region");
export const getSalesTrend = (groupBy: "day" | "month" | "year" = "month") =>
  apiFetch<{ data: TrendData[]; group_by: string }>(`/sales/trend?group_by=${groupBy}`);
export const getInventoryStatus = () => apiFetch<{ data: InventoryStatus[] }>("/sales/inventory-status");
