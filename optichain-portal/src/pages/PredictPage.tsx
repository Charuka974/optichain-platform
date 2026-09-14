import React, { useState } from 'react';
import {
  Package, User, DollarSign, BarChart2, Zap, RefreshCw,
  MapPin, Truck, AlertTriangle, CheckCircle, Clock, TrendingUp,
  ChevronRight, Info
} from 'lucide-react';
import { predictAPI } from '../api';
import { useToast } from '../contexts/ToastContext';
import type { PredictionInput, PredictionResult } from '../types';

// ─── Dropdown options ────────────────────────────────────────────────────────
const ORDER_TYPES      = ['DEBIT', 'TRANSFER', 'CASH', 'PAYMENT'];
const ORDER_STATUSES   = ['COMPLETE', 'PENDING', 'CLOSED', 'PENDING_PAYMENT', 'CANCELED', 'PROCESSING', 'SUSPECTED_FRAUD'];
const SHIPPING_MODES   = ['Standard Class', 'First Class', 'Second Class', 'Same Day'];
const CUST_SEGMENTS    = ['Consumer', 'Corporate', 'Home Office'];

// ─── Sample data pool (randomised on each click) ─────────────────────────────
const SAMPLE_POOL: PredictionInput[] = [
  {
    Type: 'DEBIT', Order_Status: 'PROCESSING', Shipping_Mode: 'Standard Class',
    Market: 'LATAM', Order_Region: 'South America', Order_Country: 'Brazil',
    Order_State: 'São Paulo', Order_City: 'São Paulo',
    order_date: '2024-06-15T09:30',
    Customer_Segment: 'Corporate', Customer_Country: 'Brazil',
    Customer_State: 'São Paulo', Customer_City: 'São Paulo',
    Category_Name: 'Electronics', Department_Name: 'Technology',
    Sales: 8750.50, Order_Item_Quantity: 12, Order_Item_Product_Price: 729.21,
    Order_Item_Discount: 218.76, Order_Item_Discount_Rate: 0.03,
    Sales_per_customer: 729.21, Order_Item_Total: 8531.74,
  },
  {
    Type: 'PAYMENT', Order_Status: 'COMPLETE', Shipping_Mode: 'First Class',
    Market: 'US', Order_Region: 'North America', Order_Country: 'United States',
    Order_State: 'California', Order_City: 'Los Angeles',
    order_date: '2024-09-03T14:00',
    Customer_Segment: 'Consumer', Customer_Country: 'United States',
    Customer_State: 'California', Customer_City: 'Los Angeles',
    Category_Name: 'Office Supplies', Department_Name: 'Office & General',
    Sales: 420.00, Order_Item_Quantity: 5, Order_Item_Product_Price: 84.00,
    Order_Item_Discount: 12.60, Order_Item_Discount_Rate: 0.03,
    Sales_per_customer: 84.00, Order_Item_Total: 407.40,
  },
  {
    Type: 'CASH', Order_Status: 'PENDING', Shipping_Mode: 'Second Class',
    Market: 'APAC', Order_Region: 'South Asia', Order_Country: 'India',
    Order_State: 'Maharashtra', Order_City: 'Mumbai',
    order_date: '2024-07-22T08:00',
    Customer_Segment: 'Consumer', Customer_Country: 'India',
    Customer_State: 'Maharashtra', Customer_City: 'Mumbai',
    Category_Name: 'Clothing', Department_Name: 'Apparel',
    Sales: 2180.00, Order_Item_Quantity: 20, Order_Item_Product_Price: 109.00,
    Order_Item_Discount: 65.40, Order_Item_Discount_Rate: 0.03,
    Sales_per_customer: 109.00, Order_Item_Total: 2114.60,
  },
  {
    Type: 'TRANSFER', Order_Status: 'PROCESSING', Shipping_Mode: 'Standard Class',
    Market: 'Africa', Order_Region: 'West Africa', Order_Country: 'Nigeria',
    Order_State: 'Lagos State', Order_City: 'Lagos',
    order_date: '2024-08-10T10:00',
    Customer_Segment: 'Corporate', Customer_Country: 'Nigeria',
    Customer_State: 'Lagos State', Customer_City: 'Lagos',
    Category_Name: 'Furniture', Department_Name: 'Home & Décor',
    Sales: 5640.00, Order_Item_Quantity: 6, Order_Item_Product_Price: 940.00,
    Order_Item_Discount: 169.20, Order_Item_Discount_Rate: 0.03,
    Sales_per_customer: 940.00, Order_Item_Total: 5470.80,
  },
  {
    Type: 'DEBIT', Order_Status: 'COMPLETE', Shipping_Mode: 'Same Day',
    Market: 'Europe', Order_Region: 'Western Europe', Order_Country: 'United Kingdom',
    Order_State: 'England', Order_City: 'London',
    order_date: '2024-10-01T08:00',
    Customer_Segment: 'Home Office', Customer_Country: 'United Kingdom',
    Customer_State: 'England', Customer_City: 'London',
    Category_Name: 'Sports & Outdoors', Department_Name: 'Sporting Goods',
    Sales: 890.50, Order_Item_Quantity: 5, Order_Item_Product_Price: 178.10,
    Order_Item_Discount: 26.72, Order_Item_Discount_Rate: 0.03,
    Sales_per_customer: 178.10, Order_Item_Total: 863.78,
  },
  {
    Type: 'PAYMENT', Order_Status: 'PENDING_PAYMENT', Shipping_Mode: 'Second Class',
    Market: 'LATAM', Order_Region: 'Central America', Order_Country: 'Mexico',
    Order_State: 'CDMX', Order_City: 'Mexico City',
    order_date: '2024-05-18T14:00',
    Customer_Segment: 'Consumer', Customer_Country: 'Mexico',
    Customer_State: 'CDMX', Customer_City: 'Mexico City',
    Category_Name: 'Health & Beauty', Department_Name: 'Health',
    Sales: 1340.00, Order_Item_Quantity: 10, Order_Item_Product_Price: 134.00,
    Order_Item_Discount: 40.20, Order_Item_Discount_Rate: 0.03,
    Sales_per_customer: 134.00, Order_Item_Total: 1299.80,
  },
  {
    Type: 'CASH', Order_Status: 'PROCESSING', Shipping_Mode: 'Standard Class',
    Market: 'APAC', Order_Region: 'Southeast Asia', Order_Country: 'Indonesia',
    Order_State: 'DKI Jakarta', Order_City: 'Jakarta',
    order_date: '2024-11-05T10:00',
    Customer_Segment: 'Consumer', Customer_Country: 'Indonesia',
    Customer_State: 'DKI Jakarta', Customer_City: 'Jakarta',
    Category_Name: 'Toys & Games', Department_Name: 'Kids',
    Sales: 760.00, Order_Item_Quantity: 8, Order_Item_Product_Price: 95.00,
    Order_Item_Discount: 22.80, Order_Item_Discount_Rate: 0.03,
    Sales_per_customer: 95.00, Order_Item_Total: 737.20,
  },
  {
    Type: 'DEBIT', Order_Status: 'COMPLETE', Shipping_Mode: 'First Class',
    Market: 'US', Order_Region: 'North America', Order_Country: 'Canada',
    Order_State: 'Ontario', Order_City: 'Toronto',
    order_date: '2024-03-27T09:00',
    Customer_Segment: 'Home Office', Customer_Country: 'Canada',
    Customer_State: 'Ontario', Customer_City: 'Toronto',
    Category_Name: 'Books & Stationery', Department_Name: 'Education',
    Sales: 215.00, Order_Item_Quantity: 5, Order_Item_Product_Price: 43.00,
    Order_Item_Discount: 6.45, Order_Item_Discount_Rate: 0.03,
    Sales_per_customer: 43.00, Order_Item_Total: 208.55,
  },
  {
    Type: 'TRANSFER', Order_Status: 'PROCESSING', Shipping_Mode: 'Standard Class',
    Market: 'Europe', Order_Region: 'Western Europe', Order_Country: 'Germany',
    Order_State: 'Berlin', Order_City: 'Berlin',
    order_date: '2024-04-12T12:00',
    Customer_Segment: 'Home Office', Customer_Country: 'Germany',
    Customer_State: 'Berlin', Customer_City: 'Berlin',
    Category_Name: 'Garden & Tools', Department_Name: 'Home Improvement',
    Sales: 1125.00, Order_Item_Quantity: 9, Order_Item_Product_Price: 125.00,
    Order_Item_Discount: 33.75, Order_Item_Discount_Rate: 0.03,
    Sales_per_customer: 125.00, Order_Item_Total: 1091.25,
  },
  {
    Type: 'PAYMENT', Order_Status: 'COMPLETE', Shipping_Mode: 'Same Day',
    Market: 'APAC', Order_Region: 'East Asia', Order_Country: 'Japan',
    Order_State: 'Tokyo', Order_City: 'Tokyo',
    order_date: '2024-12-01T07:00',
    Customer_Segment: 'Corporate', Customer_Country: 'Japan',
    Customer_State: 'Tokyo', Customer_City: 'Tokyo',
    Category_Name: 'Electronics', Department_Name: 'Technology',
    Sales: 6700.00, Order_Item_Quantity: 10, Order_Item_Product_Price: 670.00,
    Order_Item_Discount: 201.00, Order_Item_Discount_Rate: 0.03,
    Sales_per_customer: 670.00, Order_Item_Total: 6499.00,
  },
];

function pickRandomSample(): PredictionInput {
  return SAMPLE_POOL[Math.floor(Math.random() * SAMPLE_POOL.length)];
}


// ─── Result card ─────────────────────────────────────────────────────────────
// Derive risk level client-side from delay_probability
function getRiskLevel(prob: number): 'Low' | 'Medium' | 'High' {
  if (prob < 0.33) return 'Low';
  if (prob < 0.66) return 'Medium';
  return 'High';
}

function ResultCard({ result, input }: { result: PredictionResult; input: PredictionInput }) {
  const risk = getRiskLevel(result.delay_probability);
  const pct  = Math.round(result.delay_probability * 100);
  const predictedStatus = result.delayed === 1 ? 'Late Delivery' : 'On Time';

  const meta = {
    Low:    { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)',  glow: 'rgba(16,185,129,0.25)', label: 'Low Risk',    icon: <CheckCircle size={28} />, pulse: 'rgba(16,185,129,0.2)' },
    Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)',  glow: 'rgba(245,158,11,0.25)', label: 'Medium Risk',  icon: <AlertTriangle size={28} />, pulse: 'rgba(245,158,11,0.2)' },
    High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',   glow: 'rgba(239,68,68,0.25)',  label: 'High Risk',    icon: <AlertTriangle size={28} />, pulse: 'rgba(239,68,68,0.2)' },
  };
  const m = meta[risk];

  const probColor =
    pct < 33 ? '#10b981' :
    pct < 66 ? '#f59e0b' : '#ef4444';

  return (
    <div
      id="prediction-result-card"
      className="glass-card animate-fade-in-up"
      style={{
        padding: '32px',
        borderColor: m.border,
        boxShadow: `0 8px 40px ${m.glow}, 0 0 0 1px ${m.border}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow blob */}
      <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px',
        background: `radial-gradient(circle, ${m.glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
        <BarChart2 size={18} color={m.color} />
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>Prediction Result</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'center' }}>
        {/* Risk gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative', width: '140px', height: '140px' }}>
            {/* Pulse rings */}
            {[1, 2].map((i) => (
              <div key={i} style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `2px solid ${m.color}`,
                animation: `pulse-ring 2s ease-out ${i * 0.6}s infinite`,
              }} />
            ))}
            {/* Main circle */}
            <div style={{
              width: '140px', height: '140px', borderRadius: '50%',
              background: m.bg, border: `3px solid ${m.border}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '6px',
              boxShadow: `0 0 32px ${m.glow}`,
              position: 'relative',
            }}>
              <div style={{ color: m.color }}>{m.icon}</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: '800', color: m.color, lineHeight: 1 }}>
                {pct}%
              </div>
            </div>
          </div>
          <div>
            <div style={{ textAlign: 'center', fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: '700', color: m.color }}>
              {m.label}
            </div>
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', marginTop: '3px' }}>Late delivery probability</div>
          </div>
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <DetailRow icon={<Truck size={15} />} label="Predicted Status" value={predictedStatus} color={m.color} />
          <DetailRow icon={<TrendingUp size={15} />} label="Delay Probability" value={`${pct}%`} />
          <DetailRow icon={<MapPin size={15} />} label="Destination" value={`${input.Order_City}, ${input.Order_Country}`} />
          <DetailRow icon={<Package size={15} />} label="Category" value={input.Category_Name} />
          <DetailRow icon={<Clock size={15} />} label="Shipping Mode" value={input.Shipping_Mode} />
          <DetailRow icon={<DollarSign size={15} />} label="Order Total" value={`$${Number(input.Order_Item_Total).toLocaleString()}`} />
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Risk Score</span>
          <span style={{ fontSize: '12px', fontWeight: '700', color: probColor }}>{pct}%</span>
        </div>
        <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: pct < 33 ? 'var(--gradient-success)' : pct < 66 ? 'var(--gradient-warning)' : 'var(--gradient-danger)',
            borderRadius: '4px',
            transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={{ fontSize: '11px', color: '#10b981' }}>Low</span>
          <span style={{ fontSize: '11px', color: '#f59e0b' }}>Medium</span>
          <span style={{ fontSize: '11px', color: '#ef4444' }}>High</span>
        </div>
      </div>

      {/* Summary */}
      <div style={{
        marginTop: '24px', padding: '14px 16px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.07)',
        fontSize: '13px', color: '#94a3b8', lineHeight: 1.6,
      }}>
        <span style={{ fontWeight: '600', color: '#c8d8ff' }}>Order Summary: </span>
        {input.Type} order of{' '}
        <strong style={{ color: '#e2e8f0' }}>{input.Category_Name}</strong> from{' '}
        <strong style={{ color: '#e2e8f0' }}>{input.Department_Name}</strong>, qty{' '}
        <strong style={{ color: '#e2e8f0' }}>{input.Order_Item_Quantity}</strong>, shipped via{' '}
        <strong style={{ color: '#e2e8f0' }}>{input.Shipping_Mode}</strong> to{' '}
        <strong style={{ color: '#e2e8f0' }}>{input.Order_City}</strong>. Total:{' '}
        <strong style={{ color: m.color }}>${Number(input.Order_Item_Total).toLocaleString()}</strong>.
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ color: '#64748b', flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: color || '#e2e8f0', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Field helpers ────────────────────────────────────────────────────────────
function FieldGroup({ label, htmlFor, error, children, hint }: { label: string; htmlFor?: string; error?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="form-label">{label}</label>
      {children}
      {hint && !error && <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '4px' }}>{hint}</div>}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function FormSection({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="glass-card" style={{ padding: '28px' }}>
      <div className="section-header">
        <div className="section-icon">{icon}</div>
        <div>
          <div className="section-title">{title}</div>
          <div className="section-subtitle">{subtitle}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PredictPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<PredictionResult | null>(null);
  const [submittedInput, setSubmittedInput] = useState<PredictionInput | null>(null);
  const [errors,  setErrors]  = useState<Partial<Record<keyof PredictionInput, string>>>({});

  const [form, setForm] = useState<PredictionInput>({
    Type: '', Order_Status: '', Shipping_Mode: '', Market: '', Order_Region: '',
    Order_Country: '', Order_State: '', Order_City: '', order_date: '',
    Customer_Segment: '', Customer_Country: '', Customer_State: '', Customer_City: '',
    Category_Name: '', Department_Name: '',
    Sales: 0, Order_Item_Quantity: 1, Order_Item_Product_Price: 0,
    Order_Item_Discount: 0, Order_Item_Discount_Rate: 0,
    Sales_per_customer: 0, Order_Item_Total: 0,
  });

  function set(field: keyof PredictionInput, value: string | number) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  }

  function loadSample() {
    const sample = pickRandomSample();
    setForm(sample);
    setErrors({});
    setResult(null);
    showToast('info', 'Sample data loaded', `Randomised order: ${sample.Category_Name} → ${sample.Order_City}`);
  }

  function validate(): boolean {
    const e: Partial<Record<keyof PredictionInput, string>> = {};
    const req: (keyof PredictionInput)[] = [
      'Type','Order_Status','Shipping_Mode','Market','Order_Region','Order_Country',
      'Order_State','Order_City','order_date','Customer_Segment','Customer_Country',
      'Customer_State','Customer_City','Category_Name','Department_Name',
    ];
    for (const k of req) {
      if (!form[k]) e[k] = 'This field is required';
    }
    if (form.Sales <= 0)                           e.Sales                   = 'Must be greater than 0';
    if (form.Order_Item_Quantity < 1)              e.Order_Item_Quantity     = 'Must be at least 1';
    if (form.Order_Item_Product_Price <= 0)        e.Order_Item_Product_Price= 'Must be greater than 0';
    if (form.Order_Item_Discount_Rate < 0 || form.Order_Item_Discount_Rate > 1)
                                                    e.Order_Item_Discount_Rate= 'Must be between 0 and 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      showToast('error', 'Validation error', 'Please fix the highlighted fields.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await predictAPI.predict(form);
      setResult(res);
      setSubmittedInput(form);
      const derivedRisk = getRiskLevel(res.delay_probability);
      showToast('success', 'Prediction complete!', `Risk: ${derivedRisk} — ${Math.round(res.delay_probability * 100)}% delay probability`);
      setTimeout(() => {
        document.getElementById('prediction-result-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Prediction failed. Please check your connection and try again.';
      showToast('error', 'Prediction failed', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 60px' }}>
      {/* Page header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b6ef8', boxShadow: '0 0 8px #3b6ef8' }} />
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Risk Prediction</span>
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.025em', marginBottom: '6px' }}>
            Late Delivery Risk Analysis
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '520px' }}>
            Enter order details below to predict the probability of late delivery using our ML model.
          </p>
        </div>
        <button
          id="load-sample-btn"
          onClick={loadSample}
          className="btn-secondary"
          style={{ flexShrink: 0 }}
        >
          <RefreshCw size={15} /> Load Sample Data
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* ── 1. Order Information ── */}
          <FormSection icon={<Package size={18} color="#93b4ff" />} title="Order Information" subtitle="Shipment type, status, routing and date">
            <div style={grid3}>
              <FieldGroup label="Order Type" htmlFor="Type" error={errors.Type}>
                <select id="Type" className={`form-select${errors.Type ? ' error' : ''}`} value={form.Type} onChange={(e) => set('Type', e.target.value)}>
                  <option value="">Select type…</option>
                  {ORDER_TYPES.map((o) => <option key={o}>{o}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Order Status" htmlFor="Order_Status" error={errors.Order_Status}>
                <select id="Order_Status" className={`form-select${errors.Order_Status ? ' error' : ''}`} value={form.Order_Status} onChange={(e) => set('Order_Status', e.target.value)}>
                  <option value="">Select status…</option>
                  {ORDER_STATUSES.map((o) => <option key={o}>{o}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Shipping Mode" htmlFor="Shipping_Mode" error={errors.Shipping_Mode}>
                <select id="Shipping_Mode" className={`form-select${errors.Shipping_Mode ? ' error' : ''}`} value={form.Shipping_Mode} onChange={(e) => set('Shipping_Mode', e.target.value)}>
                  <option value="">Select mode…</option>
                  {SHIPPING_MODES.map((o) => <option key={o}>{o}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Market" htmlFor="Market" error={errors.Market}>
                <input id="Market" type="text" className={`form-input${errors.Market ? ' error' : ''}`} placeholder="e.g. LATAM" value={form.Market} onChange={(e) => set('Market', e.target.value)} />
              </FieldGroup>
              <FieldGroup label="Order Region" htmlFor="Order_Region" error={errors.Order_Region}>
                <input id="Order_Region" type="text" className={`form-input${errors.Order_Region ? ' error' : ''}`} placeholder="e.g. South America" value={form.Order_Region} onChange={(e) => set('Order_Region', e.target.value)} />
              </FieldGroup>
              <FieldGroup label="Order Country" htmlFor="Order_Country" error={errors.Order_Country}>
                <input id="Order_Country" type="text" className={`form-input${errors.Order_Country ? ' error' : ''}`} placeholder="e.g. Brazil" value={form.Order_Country} onChange={(e) => set('Order_Country', e.target.value)} />
              </FieldGroup>
              <FieldGroup label="Order State" htmlFor="Order_State" error={errors.Order_State}>
                <input id="Order_State" type="text" className={`form-input${errors.Order_State ? ' error' : ''}`} placeholder="e.g. São Paulo" value={form.Order_State} onChange={(e) => set('Order_State', e.target.value)} />
              </FieldGroup>
              <FieldGroup label="Order City" htmlFor="Order_City" error={errors.Order_City}>
                <input id="Order_City" type="text" className={`form-input${errors.Order_City ? ' error' : ''}`} placeholder="e.g. São Paulo" value={form.Order_City} onChange={(e) => set('Order_City', e.target.value)} />
              </FieldGroup>
              <FieldGroup label="Order Date & Time" htmlFor="order_date" error={errors.order_date}>
                <input id="order_date" type="datetime-local" className={`form-input${errors.order_date ? ' error' : ''}`} value={form.order_date} onChange={(e) => set('order_date', e.target.value)}
                  style={{ colorScheme: 'dark' }} />
              </FieldGroup>
            </div>
          </FormSection>

          {/* ── 2. Customer Information ── */}
          <FormSection icon={<User size={18} color="#a78bfa" />} title="Customer Information" subtitle="Customer segment and delivery address">
            <div style={grid4}>
              <FieldGroup label="Customer Segment" htmlFor="Customer_Segment" error={errors.Customer_Segment}>
                <select id="Customer_Segment" className={`form-select${errors.Customer_Segment ? ' error' : ''}`} value={form.Customer_Segment} onChange={(e) => set('Customer_Segment', e.target.value)}>
                  <option value="">Select segment…</option>
                  {CUST_SEGMENTS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Customer Country" htmlFor="Customer_Country" error={errors.Customer_Country}>
                <input id="Customer_Country" type="text" className={`form-input${errors.Customer_Country ? ' error' : ''}`} placeholder="e.g. Brazil" value={form.Customer_Country} onChange={(e) => set('Customer_Country', e.target.value)} />
              </FieldGroup>
              <FieldGroup label="Customer State" htmlFor="Customer_State" error={errors.Customer_State}>
                <input id="Customer_State" type="text" className={`form-input${errors.Customer_State ? ' error' : ''}`} placeholder="e.g. São Paulo" value={form.Customer_State} onChange={(e) => set('Customer_State', e.target.value)} />
              </FieldGroup>
              <FieldGroup label="Customer City" htmlFor="Customer_City" error={errors.Customer_City}>
                <input id="Customer_City" type="text" className={`form-input${errors.Customer_City ? ' error' : ''}`} placeholder="e.g. São Paulo" value={form.Customer_City} onChange={(e) => set('Customer_City', e.target.value)} />
              </FieldGroup>
            </div>
          </FormSection>

          {/* ── 3. Product & Financial ── */}
          <FormSection icon={<DollarSign size={18} color="#34d399" />} title="Product & Financial" subtitle="Product category, pricing, discounts and totals">
            <div style={grid3}>
              <FieldGroup label="Category Name" htmlFor="Category_Name" error={errors.Category_Name}>
                <input id="Category_Name" type="text" className={`form-input${errors.Category_Name ? ' error' : ''}`} placeholder="e.g. Electronics" value={form.Category_Name} onChange={(e) => set('Category_Name', e.target.value)} />
              </FieldGroup>
              <FieldGroup label="Department Name" htmlFor="Department_Name" error={errors.Department_Name}>
                <input id="Department_Name" type="text" className={`form-input${errors.Department_Name ? ' error' : ''}`} placeholder="e.g. Technology" value={form.Department_Name} onChange={(e) => set('Department_Name', e.target.value)} />
              </FieldGroup>
              <FieldGroup label="Sales ($)" htmlFor="Sales" error={errors.Sales}>
                <input id="Sales" type="number" step="0.01" min="0" className={`form-input${errors.Sales ? ' error' : ''}`} placeholder="0.00" value={form.Sales || ''} onChange={(e) => set('Sales', parseFloat(e.target.value) || 0)} />
              </FieldGroup>
              <FieldGroup label="Order Item Quantity" htmlFor="Order_Item_Quantity" error={errors.Order_Item_Quantity}>
                <input id="Order_Item_Quantity" type="number" min="1" step="1" className={`form-input${errors.Order_Item_Quantity ? ' error' : ''}`} placeholder="1" value={form.Order_Item_Quantity || ''} onChange={(e) => set('Order_Item_Quantity', parseInt(e.target.value) || 0)} />
              </FieldGroup>
              <FieldGroup label="Product Price ($)" htmlFor="Order_Item_Product_Price" error={errors.Order_Item_Product_Price}>
                <input id="Order_Item_Product_Price" type="number" step="0.01" min="0" className={`form-input${errors.Order_Item_Product_Price ? ' error' : ''}`} placeholder="0.00" value={form.Order_Item_Product_Price || ''} onChange={(e) => set('Order_Item_Product_Price', parseFloat(e.target.value) || 0)} />
              </FieldGroup>
              <FieldGroup label="Discount Amount ($)" htmlFor="Order_Item_Discount" error={errors.Order_Item_Discount}>
                <input id="Order_Item_Discount" type="number" step="0.01" min="0" className={`form-input${errors.Order_Item_Discount ? ' error' : ''}`} placeholder="0.00" value={form.Order_Item_Discount || ''} onChange={(e) => set('Order_Item_Discount', parseFloat(e.target.value) || 0)} />
              </FieldGroup>
              <FieldGroup label="Discount Rate" htmlFor="Order_Item_Discount_Rate" error={errors.Order_Item_Discount_Rate} hint="Value between 0 and 1 (e.g. 0.05 = 5%)">
                <input id="Order_Item_Discount_Rate" type="number" step="0.001" min="0" max="1" className={`form-input${errors.Order_Item_Discount_Rate ? ' error' : ''}`} placeholder="0.00 – 1.00" value={form.Order_Item_Discount_Rate || ''} onChange={(e) => set('Order_Item_Discount_Rate', parseFloat(e.target.value) || 0)} />
              </FieldGroup>
              <FieldGroup label="Sales per Customer ($)" htmlFor="Sales_per_customer" error={errors.Sales_per_customer}>
                <input id="Sales_per_customer" type="number" step="0.01" min="0" className={`form-input${errors.Sales_per_customer ? ' error' : ''}`} placeholder="0.00" value={form.Sales_per_customer || ''} onChange={(e) => set('Sales_per_customer', parseFloat(e.target.value) || 0)} />
              </FieldGroup>
              <FieldGroup label="Order Item Total ($)" htmlFor="Order_Item_Total" error={errors.Order_Item_Total}>
                <input id="Order_Item_Total" type="number" step="0.01" min="0" className={`form-input${errors.Order_Item_Total ? ' error' : ''}`} placeholder="0.00" value={form.Order_Item_Total || ''} onChange={(e) => set('Order_Item_Total', parseFloat(e.target.value) || 0)} />
              </FieldGroup>
            </div>
          </FormSection>

          {/* ── Submit ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
            <button
              id="predict-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ padding: '16px 48px', fontSize: '16px', borderRadius: '12px', minWidth: '280px' }}
            >
              {loading ? (
                <><div className="spinner" /> Analysing risk…</>
              ) : (
                <><Zap size={18} /> Predict Late Delivery Risk <ChevronRight size={16} /></>
              )}
            </button>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                <Info size={13} />
                Sending to ML model — this may take a moment
              </div>
            )}
          </div>
        </div>
      </form>

      {/* ── Result ── */}
      {result && submittedInput && (
        <div style={{ marginTop: '36px' }}>
          <ResultCard result={result} input={submittedInput} />
        </div>
      )}
    </div>
  );
}

// Grid helpers
const grid3: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '18px',
};
const grid4: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '18px',
};
