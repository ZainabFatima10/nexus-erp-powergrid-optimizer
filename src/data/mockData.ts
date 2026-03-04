export const inventoryItems = [
  { id: 1, name: "Distribution Transformers (11kV)", stock: 142, status: "OK" as const, lastUpdated: "2026-03-03" },
  { id: 2, name: "Circuit Breakers (33kV)", stock: 23, status: "Low" as const, lastUpdated: "2026-03-02" },
  { id: 3, name: "Power Cables (HT)", stock: 8500, status: "OK" as const, lastUpdated: "2026-03-03" },
  { id: 4, name: "Smart Meters (AMI)", stock: 4, status: "Critical" as const, lastUpdated: "2026-03-01" },
  { id: 5, name: "Surge Arresters", stock: 67, status: "OK" as const, lastUpdated: "2026-03-03" },
  { id: 6, name: "Insulators (Porcelain)", stock: 12, status: "Low" as const, lastUpdated: "2026-02-28" },
  { id: 7, name: "Relay Protection Units", stock: 31, status: "OK" as const, lastUpdated: "2026-03-03" },
  { id: 8, name: "Copper Conductors", stock: 2, status: "Critical" as const, lastUpdated: "2026-03-01" },
];

export const currentOrders = [
  { id: "ORD-2401", item: "Smart Meters (AMI)", qty: 500, vendor: "Siemens AG", contractStatus: "Verified" as const, stage: "Manufacturing", delivery: "2026-03-18" },
  { id: "ORD-2402", item: "Circuit Breakers (33kV)", qty: 50, vendor: "ABB Ltd", contractStatus: "Pending" as const, stage: "Procurement", delivery: "2026-03-25" },
  { id: "ORD-2403", item: "Copper Conductors", qty: 2000, vendor: "Prysmian Group", contractStatus: "Verified" as const, stage: "Shipping", delivery: "2026-03-10" },
  { id: "ORD-2404", item: "Insulators (Porcelain)", qty: 200, vendor: "NGK Insulators", contractStatus: "Unverified" as const, stage: "Review", delivery: "2026-04-01" },
];

export const pastOrders = [
  { id: "ORD-2380", item: "Distribution Transformers", qty: 80, vendor: "Siemens AG", txHash: "0x7a3f...e9b2", completedDate: "2026-02-15" },
  { id: "ORD-2381", item: "Power Cables (HT)", qty: 5000, vendor: "Nexans", txHash: "0x1b4c...d7a1", completedDate: "2026-02-10" },
  { id: "ORD-2382", item: "Surge Arresters", qty: 100, vendor: "ABB Ltd", txHash: "0x9e2d...f3c8", completedDate: "2026-01-28" },
];

export const reorderItems = [
  { id: 4, name: "Smart Meters (AMI)", stock: 4, threshold: 50, autoTriggered: true, triggerDate: "2026-03-01" },
  { id: 8, name: "Copper Conductors", stock: 2, threshold: 100, autoTriggered: true, triggerDate: "2026-03-01" },
  { id: 6, name: "Insulators (Porcelain)", stock: 12, threshold: 60, autoTriggered: false, triggerDate: null },
];

export const outageForecast = [
  { day: "Mon", date: "Mar 3", probability: 12, risk: "Low" as const, areas: ["G-11", "I-8"], weather: ["Clear skies"], actions: ["Routine monitoring"] },
  { day: "Tue", date: "Mar 4", probability: 35, risk: "Medium" as const, areas: ["F-7", "G-9", "E-11"], weather: ["High winds expected", "Temp spike"], actions: ["Pre-position repair crews", "Alert field engineers"] },
  { day: "Wed", date: "Mar 5", probability: 78, risk: "High" as const, areas: ["F-6", "F-7", "G-6", "I-10", "H-9"], weather: ["Severe thunderstorm warning", "Heavy rain"], actions: ["Deploy emergency crews", "Activate backup generators", "Notify affected customers"] },
  { day: "Thu", date: "Mar 6", probability: 45, risk: "Medium" as const, areas: ["G-11", "F-8"], weather: ["Post-storm winds"], actions: ["Inspect infrastructure", "Clear debris"] },
  { day: "Fri", date: "Mar 7", probability: 8, risk: "Low" as const, areas: ["I-8"], weather: ["Clear"], actions: ["Standard operations"] },
  { day: "Sat", date: "Mar 8", probability: 15, risk: "Low" as const, areas: ["G-10"], weather: ["Partly cloudy"], actions: ["Weekend skeleton crew"] },
  { day: "Sun", date: "Mar 9", probability: 62, risk: "High" as const, areas: ["F-7", "G-9", "H-8", "E-11"], weather: ["Heatwave alert", "Grid overload risk"], actions: ["Load shedding preparation", "Activate demand response", "Public advisory"] },
];

export const complaints = {
  unresolved: [
    { id: "TKT-5001", category: "Power Outage", summary: "Complete blackout in G-11/3 since 2 hours. No prior notice given.", area: "G-11", timeSince: "2h 15m", status: "Open" as const, escalated: false },
    { id: "TKT-5002", category: "Billing", summary: "Overcharged by PKR 12,000 on February bill. Meter reading seems incorrect.", area: "F-7", timeSince: "5h 30m", status: "Open" as const, escalated: false },
    { id: "TKT-5003", category: "Power Outage", summary: "Frequent load shedding beyond scheduled hours in I-8 sector.", area: "I-8", timeSince: "1d 2h", status: "Open" as const, escalated: true },
    { id: "TKT-5004", category: "Fault", summary: "Sparking observed from transformer near F-6 market. Potential fire hazard.", area: "F-6", timeSince: "45m", status: "Open" as const, escalated: true },
    { id: "TKT-5005", category: "Billing", summary: "Duplicate bill generated for the same month.", area: "G-9", timeSince: "3h 10m", status: "Open" as const, escalated: false },
  ],
  resolved: [
    { id: "TKT-4990", category: "Power Outage", summary: "Scheduled maintenance outage lasted 2 hours longer than announced.", area: "E-11", resolvedAt: "2026-03-02 14:30", resolver: "Engr. Ahmed Khan", note: "Extended due to unexpected cable damage. Completed and restored." },
    { id: "TKT-4991", category: "Fault", summary: "Streetlight malfunction on main boulevard H-9.", area: "H-9", resolvedAt: "2026-03-01 09:15", resolver: "Tech. Bilal Raza", note: "Replaced faulty MCB and rewired connection." },
    { id: "TKT-4992", category: "Billing", summary: "Customer charged industrial rate instead of residential.", area: "G-10", resolvedAt: "2026-02-28 16:45", resolver: "Admin. Sara Malik", note: "Tariff category corrected. Refund processed." },
  ],
};

export const notifications = [
  { id: 1, category: "Confirmations" as const, title: "Order ORD-2401 Confirmed", desc: "Smart Meters order verified on blockchain. Delivery expected Mar 18.", time: "10m ago", read: false },
  { id: 2, category: "Outage Updates" as const, title: "High Outage Risk — Wednesday", desc: "AI model predicts 78% outage probability for Mar 5. Thunderstorm warning active.", time: "25m ago", read: false },
  { id: 3, category: "User Complaints" as const, title: "Escalated: TKT-5004", desc: "Sparking transformer in F-6 flagged as critical. Immediate attention required.", time: "45m ago", read: false },
  { id: 4, category: "Resource Allocation" as const, title: "Emergency Crew Deployed", desc: "3 field engineers dispatched to F-6 sector for transformer inspection.", time: "1h ago", read: true },
  { id: 5, category: "Confirmations" as const, title: "Reorder Auto-Triggered", desc: "VEMA triggered reorder for Copper Conductors — stock below threshold.", time: "2h ago", read: true },
  { id: 6, category: "Updates" as const, title: "System Maintenance Complete", desc: "Scheduled database optimization completed successfully.", time: "3h ago", read: true },
  { id: 7, category: "Outage Updates" as const, title: "Sunday Heatwave Advisory", desc: "Load shedding preparation recommended for Mar 9. Grid overload risk detected.", time: "4h ago", read: true },
  { id: 8, category: "User Complaints" as const, title: "New Complaint: TKT-5005", desc: "Duplicate billing reported for G-9 sector.", time: "5h ago", read: true },
];
