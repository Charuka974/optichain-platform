// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  email: string;
  role: string;
}

// ─── Prediction Input ────────────────────────────────────────────────────────
export interface PredictionInput {
  // Order Information
  Type: string;
  Order_Status: string;
  Shipping_Mode: string;
  Market: string;
  Order_Region: string;
  Order_Country: string;
  Order_State: string;
  Order_City: string;
  order_date: string; // ISO string

  // Customer Information
  Customer_Segment: string;
  Customer_Country: string;
  Customer_State: string;
  Customer_City: string;

  // Product & Financial
  Category_Name: string;
  Department_Name: string;
  Sales: number;
  Order_Item_Quantity: number;
  Order_Item_Product_Price: number;
  Order_Item_Discount: number;
  Order_Item_Discount_Rate: number;
  Sales_per_customer: number;
  Order_Item_Total: number;
}

// ─── Prediction Output ───────────────────────────────────────────────────────
// Derived client-side from delay_probability
export type RiskLevel = 'Low' | 'Medium' | 'High';

/** Shape returned by POST /api/predict */
export interface PredictionResult {
  delayed: 0 | 1;           // 1 = delayed, 0 = on time
  delay_probability: number; // 0.0 – 1.0
  status: string;            // 'Success' | ...
}

// ─── History ─────────────────────────────────────────────────────────────────
/** Space-keyed input object stored as JSON string in input_data */
export interface RawHistoryInput {
  'Type'?: string;
  'Customer Segment'?: string;
  'Shipping Mode'?: string;
  'Market'?: string;
  'Order Region'?: string;
  'Category Name'?: string;
  'Customer City'?: string;
  'Customer Country'?: string;
  'Customer State'?: string;
  'Order City'?: string;
  'Order Country'?: string;
  'Order State'?: string;
  'Department Name'?: string;
  'Order Status'?: string;
  'order date (DateOrders)'?: string;
  'Sales'?: number;
  'Order Item Quantity'?: number;
  'Order Item Product Price'?: number;
  'Order Item Discount'?: number;
  'Order Item Discount Rate'?: number;
  'Sales per customer'?: number;
  'Order Item Total'?: number;
}

/** Shape returned by GET /api/predictions/history */
export interface PredictionHistoryItem {
  id: number;
  created_at: string;       // ISO datetime string
  delayed: 0 | 1;           // 1 = late, 0 = on time
  delay_probability: number; // 0.0 – 1.0
  input_data: string;        // JSON-serialised RawHistoryInput
  user_id: number;
}

// ─── UI ──────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}
