import React, { useEffect, useState } from 'react';
import { Clock, TrendingUp, Package, Truck, Eye, X, AlertTriangle, CheckCircle, BarChart2, MapPin, DollarSign, RefreshCw } from 'lucide-react';
import { predictAPI } from '../api';
import { useToast } from '../contexts/ToastContext';
import type { PredictionHistoryItem, RawHistoryInput, RiskLevel } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRiskLevel(prob: number): RiskLevel {
  if (prob < 0.33) return 'Low';
  if (prob < 0.66) return 'Medium';
  return 'High';
}

function parseInput(raw: string): RawHistoryInput {
  try { return JSON.parse(raw) as RawHistoryInput; }
  catch { return {}; }
}

// ─── Risk badge helper ────────────────────────────────────────────────────────
function RiskBadge({ level }: { level: RiskLevel }) {
  const cls  = level === 'Low' ? 'badge-low' : level === 'Medium' ? 'badge-medium' : 'badge-high';
  const icon = level === 'Low' ? <CheckCircle size={11} /> : <AlertTriangle size={11} />;
  return <span className={`badge ${cls}`}>{icon} {level}</span>;
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ item, onClose }: { item: PredictionHistoryItem; onClose: () => void }) {
  const inp       = parseInput(item.input_data);
  const risk      = getRiskLevel(item.delay_probability);
  const pct       = Math.round(item.delay_probability * 100);
  const status    = item.delayed === 1 ? 'Late Delivery' : 'On Time';

  const riskColor =
    risk === 'Low' ? '#10b981' :
    risk === 'Medium' ? '#f59e0b' : '#ef4444';

  const riskRgb =
    risk === 'Low' ? '16,185,129' :
    risk === 'Medium' ? '245,158,11' : '239,68,68';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(5, 8, 18, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-modal="true"
      role="dialog"
      aria-label="Prediction details"
    >
      <div
        className="glass-card animate-fade-in-up"
        style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}
      >
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <BarChart2 size={18} color="#3b6ef8" />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>
                Prediction Details
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              {new Date(item.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" aria-label="Close modal" style={{ padding: '8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Risk summary strip */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderRadius: '12px',
          background: `rgba(${riskRgb}, 0.1)`,
          border: `1px solid rgba(${riskRgb}, 0.25)`,
          marginBottom: '24px',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Risk Level</div>
            <RiskBadge level={risk} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Delay Probability</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: '800', color: riskColor }}>{pct}%</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Predicted Status</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>{status}</div>
          </div>
        </div>

        {/* Fields grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {([
            ['Order Type',       inp['Type']],
            ['Order Status',     inp['Order Status']],
            ['Shipping Mode',    inp['Shipping Mode']],
            ['Market',           inp['Market']],
            ['Order Region',     inp['Order Region']],
            ['Order Country',    inp['Order Country']],
            ['Order State',      inp['Order State']],
            ['Order City',       inp['Order City']],
            ['Order Date',       inp['order date (DateOrders)']],
            ['Customer Segment', inp['Customer Segment']],
            ['Customer Country', inp['Customer Country']],
            ['Customer City',    inp['Customer City']],
            ['Category',         inp['Category Name']],
            ['Department',       inp['Department Name']],
            ['Sales',            inp['Sales']   != null ? `$${Number(inp['Sales']).toLocaleString()}`   : undefined],
            ['Quantity',         inp['Order Item Quantity'] != null ? String(inp['Order Item Quantity']) : undefined],
            ['Product Price',    inp['Order Item Product Price'] != null ? `$${Number(inp['Order Item Product Price']).toLocaleString()}` : undefined],
            ['Discount',         inp['Order Item Discount'] != null ? `$${Number(inp['Order Item Discount']).toLocaleString()}` : undefined],
            ['Discount Rate',    inp['Order Item Discount Rate'] != null ? `${(Number(inp['Order Item Discount Rate']) * 100).toFixed(1)}%` : undefined],
            ['Order Total',      inp['Order Item Total'] != null ? `$${Number(inp['Order Item Total']).toLocaleString()}` : undefined],
          ] as [string, string | number | undefined][]).map(([label, val]) => (
            <div key={label} style={{
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{label}</div>
              <div style={{ fontSize: '13.5px', color: '#e2e8f0', fontWeight: '500' }}>{val ?? '–'}</div>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="btn-primary" style={{ width: '100%', marginTop: '24px' }}>
          Close
        </button>
      </div>
    </div>
  );
}

// ─── History Page ─────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const { showToast } = useToast();
  const [items,    setItems]    = useState<PredictionHistoryItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<PredictionHistoryItem | null>(null);

  async function fetchHistory() {
    setLoading(true);
    try {
      const data = await predictAPI.getHistory();
      setItems(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Could not load prediction history.';
      showToast('error', 'Failed to load history', msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchHistory(); }, []);

  // Summary stats — derived client-side
  const total    = items.length;
  const highRisk = items.filter((i) => getRiskLevel(i.delay_probability) === 'High').length;
  const medRisk  = items.filter((i) => getRiskLevel(i.delay_probability) === 'Medium').length;
  const lowRisk  = items.filter((i) => getRiskLevel(i.delay_probability) === 'Low').length;
  const avgProb  = total ? Math.round(items.reduce((a, i) => a + i.delay_probability, 0) / total * 100) : 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 60px' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6d4cf7', boxShadow: '0 0 8px #6d4cf7' }} />
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Prediction History</span>
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.025em', marginBottom: '6px' }}>
            Past Predictions
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Review all previous risk assessments and their outcomes.</p>
        </div>
        <button id="refresh-history-btn" onClick={fetchHistory} className="btn-secondary" disabled={loading}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {!loading && total > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <StatCard icon={<TrendingUp size={18} />} label="Total Predictions" value={String(total)} color="#3b6ef8" />
          <StatCard icon={<AlertTriangle size={18} />} label="High Risk" value={String(highRisk)} color="#ef4444" sub={`${total ? Math.round(highRisk / total * 100) : 0}% of total`} />
          <StatCard icon={<Clock size={18} />} label="Medium Risk" value={String(medRisk)} color="#f59e0b" sub={`${total ? Math.round(medRisk / total * 100) : 0}% of total`} />
          <StatCard icon={<CheckCircle size={18} />} label="Low Risk" value={String(lowRisk)} color="#10b981" sub={`${total ? Math.round(lowRisk / total * 100) : 0}% of total`} />
          <StatCard icon={<BarChart2 size={18} />} label="Avg. Risk Score" value={`${avgProb}%`} color="#6d4cf7" />
        </div>
      )}

      {/* Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div className="spinner spinner-lg" />
            <div style={{ color: '#64748b', fontSize: '14px' }}>Loading history…</div>
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '80px 40px', textAlign: 'center' }}>
            <Clock size={48} color="#1c2645" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>No predictions yet</div>
            <div style={{ fontSize: '14px', color: '#475569' }}>
              Run your first prediction to see results here.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date &amp; Time</th>
                  <th>Risk Level</th>
                  <th>Delay Prob.</th>
                  <th>Predicted Status</th>
                  <th><MapPin size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Order City</th>
                  <th><Package size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Category</th>
                  <th><DollarSign size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Sales</th>
                  <th><Truck size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Ship Mode</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const inp    = parseInput(item.input_data);
                  const risk   = getRiskLevel(item.delay_probability);
                  const pct    = Math.round(item.delay_probability * 100);
                  const status = item.delayed === 1 ? 'Late Delivery' : 'On Time';
                  return (
                    <tr key={item.id}>
                      <td style={{ color: '#475569', fontWeight: '500' }}>{idx + 1}</td>
                      <td style={{ whiteSpace: 'nowrap', color: '#94a3b8' }}>
                        {new Date(item.created_at).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td><RiskBadge level={risk} /></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', minWidth: '48px' }}>
                            <div style={{
                              height: '100%', width: `${pct}%`,
                              background: pct < 33 ? '#10b981' : pct < 66 ? '#f59e0b' : '#ef4444',
                              borderRadius: '3px',
                            }} />
                          </div>
                          <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#cbd5e1', whiteSpace: 'nowrap' }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: '#94a3b8' }}>{status}</td>
                      <td style={{ fontWeight: '500' }}>{inp['Order City'] ?? '–'}</td>
                      <td>{inp['Category Name'] ?? '–'}</td>
                      <td style={{ fontWeight: '600', color: '#e2e8f0' }}>
                        {inp['Sales'] != null ? `$${Number(inp['Sales']).toLocaleString()}` : '–'}
                      </td>
                      <td style={{ fontSize: '12.5px', color: '#64748b' }}>{inp['Shipping Mode'] ?? '–'}</td>
                      <td>
                        <button
                          id={`view-details-btn-${idx}`}
                          onClick={() => setSelected(item)}
                          className="btn-secondary"
                          style={{ padding: '5px 12px', fontSize: '12px' }}
                          aria-label={`View details for prediction ${idx + 1}`}
                        >
                          <Eye size={13} /> Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && <DetailModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function StatCard({ icon, label, value, color, sub }: { icon: React.ReactNode; label: string; value: string; color: string; sub?: string }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div style={{ color, opacity: 0.9 }}>{icon}</div>
        <div className="stat-label">{label}</div>
      </div>
      <div className="stat-value" style={{ color }}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
