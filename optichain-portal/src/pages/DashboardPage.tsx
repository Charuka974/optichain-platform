import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart2,
  CheckCircle,
  Clock,
  Globe,
  Package,
  RefreshCw,
  TrendingUp,
  Truck,
  Zap,
} from 'lucide-react';
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

function riskColor(level: RiskLevel) {
  return level === 'Low' ? '#10b981' : level === 'Medium' ? '#f59e0b' : '#ef4444';
}
function riskRgb(level: RiskLevel) {
  return level === 'Low' ? '16,185,129' : level === 'Medium' ? '245,158,11' : '239,68,68';
}

// ─── Analytics computation ────────────────────────────────────────────────────
function computeAnalytics(items: PredictionHistoryItem[]) {
  const total = items.length;
  if (total === 0) return null;

  const low    = items.filter(i => getRiskLevel(i.delay_probability) === 'Low').length;
  const medium = items.filter(i => getRiskLevel(i.delay_probability) === 'Medium').length;
  const high   = items.filter(i => getRiskLevel(i.delay_probability) === 'High').length;
  const avgRisk = items.reduce((a, i) => a + i.delay_probability, 0) / total;
  const onTimeRate = items.filter(i => i.delayed === 0).length / total;

  // ── Trend: group by date (last 30 days) ──────────────────────────────────
  const trendMap: Record<string, { sum: number; count: number }> = {};
  items.forEach(i => {
    const day = i.created_at.slice(0, 10);
    if (!trendMap[day]) trendMap[day] = { sum: 0, count: 0 };
    trendMap[day].sum += i.delay_probability;
    trendMap[day].count += 1;
  });
  const trendDays = Object.entries(trendMap)
    .map(([date, { sum, count }]) => ({ date, avg: sum / count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  // ── Shipping mode breakdown ──────────────────────────────────────────────
  const shipMap: Record<string, { delayed: number; total: number }> = {};
  items.forEach(i => {
    const inp = parseInput(i.input_data);
    const mode = inp['Shipping Mode'] ?? 'Unknown';
    if (!shipMap[mode]) shipMap[mode] = { delayed: 0, total: 0 };
    shipMap[mode].total += 1;
    if (i.delayed === 1) shipMap[mode].delayed += 1;
  });
  const shippingBreakdown = Object.entries(shipMap)
    .map(([mode, { delayed, total: t }]) => ({ mode, delayRate: delayed / t, count: t }))
    .sort((a, b) => b.delayRate - a.delayRate);

  // ── Market risk ranking ──────────────────────────────────────────────────
  const marketMap: Record<string, { sum: number; count: number }> = {};
  items.forEach(i => {
    const inp = parseInput(i.input_data);
    const market = inp['Market'] ?? 'Unknown';
    if (!marketMap[market]) marketMap[market] = { sum: 0, count: 0 };
    marketMap[market].sum += i.delay_probability;
    marketMap[market].count += 1;
  });
  const marketRanking = Object.entries(marketMap)
    .map(([market, { sum, count }]) => ({ market, avgRisk: sum / count, count }))
    .sort((a, b) => b.avgRisk - a.avgRisk)
    .slice(0, 6);

  // ── Category heatmap ─────────────────────────────────────────────────────
  const catMap: Record<string, { sum: number; count: number }> = {};
  items.forEach(i => {
    const inp = parseInput(i.input_data);
    const cat = inp['Category Name'] ?? 'Unknown';
    if (!catMap[cat]) catMap[cat] = { sum: 0, count: 0 };
    catMap[cat].sum += i.delay_probability;
    catMap[cat].count += 1;
  });
  const categoryHeatmap = Object.entries(catMap)
    .map(([cat, { sum, count }]) => ({ cat, avgRisk: sum / count, count }))
    .sort((a, b) => b.avgRisk - a.avgRisk);

  // ── Recent high-risk alerts ──────────────────────────────────────────────
  const recentHighRisk = items
    .filter(i => getRiskLevel(i.delay_probability) === 'High')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return {
    total, low, medium, high, avgRisk, onTimeRate,
    trendDays, shippingBreakdown, marketRanking, categoryHeatmap, recentHighRisk,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated KPI card */
function KpiCard({
  icon, label, value, sub, color, gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
  gradient: string;
}) {
  return (
    <div
      style={{
        background: 'rgba(15,22,41,0.75)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '22px 24px',
        transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.25s',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${color}55`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px ${color}22`;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Background glow blob */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '80px', height: '80px', borderRadius: '50%',
        background: gradient, opacity: 0.12, filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 16px ${color}44`,
        }}>
          {icon}
        </div>
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {label}
        </span>
      </div>

      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '32px', fontWeight: '800', color, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>{sub}</div>
      )}
    </div>
  );
}

/** Section wrapper card */
function SectionCard({ title, icon, children, style }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className="glass-card" style={{ padding: '24px', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '9px',
          background: 'rgba(59,110,248,0.15)', border: '1px solid rgba(59,110,248,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: '700', color: '#c8d8ff' }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

/** Pure-CSS donut ring chart */
function DonutChart({ low, medium, high, total }: { low: number; medium: number; high: number; total: number }) {
  const size = 180;
  const r = 72;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  const lowPct    = total ? low    / total : 0;
  const medPct    = total ? medium / total : 0;
  const highPct   = total ? high   / total : 0;

  // SVG stroke-dasharray / stroke-dashoffset to draw arcs
  const gap = 3;
  const gapAngle = (gap / circ) * 2 * Math.PI;

  const lowLen    = Math.max(0, circ * lowPct    - gap);
  const medLen    = Math.max(0, circ * medPct    - gap);
  const highLen   = Math.max(0, circ * highPct   - gap);

  const highStart = 0;
  const medStart  = highLen + gap;
  const lowStart  = medStart + medLen + gap;

  function arc(len: number, offset: number, color: string, id: string) {
    return (
      <circle
        key={id}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={18}
        strokeDasharray={`${len} ${circ}`}
        strokeDashoffset={-offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease', transformOrigin: `${cx}px ${cy}px`, transform: 'rotate(-90deg)' }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={18} />
          {total > 0 && (
            <>
              {arc(highLen, highStart, '#ef4444', 'high')}
              {arc(medLen,  medStart,  '#f59e0b', 'med')}
              {arc(lowLen,  lowStart,  '#10b981', 'low')}
            </>
          )}
          {/* Centre label */}
          <text x={cx} y={cy - 8} textAnchor="middle" fill="#f1f5f9" fontSize="22" fontWeight="800" fontFamily="Outfit, sans-serif">
            {total}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="600">
            TOTAL
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {([
          ['High Risk',   '#ef4444', high,   highPct],
          ['Medium Risk', '#f59e0b', medium, medPct],
          ['Low Risk',    '#10b981', low,    lowPct],
        ] as [string, string, number, number][]).map(([label, color, count, pct]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>{label}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{count} · {Math.round(pct * 100)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** SVG bar sparkline — trend over time */
function TrendChart({ days }: { days: { date: string; avg: number }[] }) {
  if (days.length === 0) return <EmptyState label="No trend data yet" />;

  const W = 600; const H = 140; const PADX = 8; const PADY = 14;
  const maxVal = Math.max(...days.map(d => d.avg), 0.01);
  const barW   = Math.max(4, (W - PADX * 2) / days.length - 3);

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: '300px', height: 'auto' }}>
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1.0].map(v => {
          const y = PADY + (H - PADY * 2) * (1 - v / 1.0);
          return (
            <line key={v} x1={PADX} x2={W - PADX} y1={y} y2={y}
              stroke="rgba(255,255,255,0.05)" strokeWidth={1} strokeDasharray="4 4" />
          );
        })}

        {days.map((d, i) => {
          const x   = PADX + i * ((W - PADX * 2) / days.length) + 1.5;
          const pct = d.avg / maxVal;
          const barH = Math.max(4, (H - PADY * 2) * pct);
          const y   = PADY + (H - PADY * 2) - barH;
          const col = d.avg < 0.33 ? '#10b981' : d.avg < 0.66 ? '#f59e0b' : '#ef4444';
          const label = d.date.slice(5); // MM-DD
          return (
            <g key={d.date}>
              <rect x={x} y={y} width={barW} height={barH} rx={3}
                fill={col} opacity={0.85} style={{ transition: 'opacity 0.2s' }}>
                <title>{d.date}: {Math.round(d.avg * 100)}% avg risk</title>
              </rect>
              {/* Date label — only show every Nth */}
              {(days.length <= 10 || i % Math.ceil(days.length / 10) === 0) && (
                <text x={x + barW / 2} y={H - 2} textAnchor="middle" fill="#475569" fontSize="9">
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#475569' }}>
        <span>Older</span><span>← Avg delay probability per day →</span><span>Recent</span>
      </div>
    </div>
  );
}

/** Horizontal bar progress — shipping modes */
function ShippingBreakdown({ rows }: { rows: { mode: string; delayRate: number; count: number }[] }) {
  if (rows.length === 0) return <EmptyState label="No shipping data" />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {rows.map(({ mode, delayRate, count }) => {
        const pct = Math.round(delayRate * 100);
        const col = delayRate < 0.33 ? '#10b981' : delayRate < 0.66 ? '#f59e0b' : '#ef4444';
        return (
          <div key={mode}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={13} color="#64748b" />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>{mode}</span>
                <span style={{ fontSize: '11px', color: '#475569' }}>({count} orders)</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: col }}>{pct}%</span>
            </div>
            <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`, borderRadius: '4px',
                background: `linear-gradient(90deg, ${col}cc, ${col})`,
                transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Market ranking list */
function MarketRanking({ rows }: { rows: { market: string; avgRisk: number; count: number }[] }) {
  if (rows.length === 0) return <EmptyState label="No market data" />;
  const maxRisk = Math.max(...rows.map(r => r.avgRisk));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {rows.map(({ market, avgRisk, count }, idx) => {
        const pct = Math.round(avgRisk * 100);
        const barPct = (avgRisk / maxRisk) * 100;
        const col = avgRisk < 0.33 ? '#10b981' : avgRisk < 0.66 ? '#f59e0b' : '#ef4444';
        return (
          <div key={market} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
              background: idx === 0 ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '700', color: idx === 0 ? '#fff' : '#475569',
            }}>
              {idx + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={12} color="#64748b" />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>{market}</span>
                  <span style={{ fontSize: '11px', color: '#475569' }}>({count})</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: col }}>{pct}%</span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)' }}>
                <div style={{
                  height: '100%', width: `${barPct}%`, borderRadius: '3px',
                  background: `linear-gradient(90deg, ${col}99, ${col})`,
                  transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
                }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Category risk heatmap grid */
function CategoryHeatmap({ cats }: { cats: { cat: string; avgRisk: number; count: number }[] }) {
  if (cats.length === 0) return <EmptyState label="No category data" />;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
      {cats.map(({ cat, avgRisk, count }) => {
        const pct  = Math.round(avgRisk * 100);
        const level = getRiskLevel(avgRisk);
        const col  = riskColor(level);
        const rgb  = riskRgb(level);
        return (
          <div key={cat} style={{
            padding: '14px 16px',
            background: `rgba(${rgb}, 0.08)`,
            border: `1px solid rgba(${rgb}, 0.2)`,
            borderRadius: '12px',
            transition: 'transform 0.2s, border-color 0.2s',
            cursor: 'default',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)'; (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${rgb}, 0.45)`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${rgb}, 0.2)`; }}
          >
            <div style={{ fontSize: '11px', fontWeight: '600', color: col, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              {level}
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: col, fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
              {pct}%
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0', marginTop: '5px' }}>{cat}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{count} orders</div>
          </div>
        );
      })}
    </div>
  );
}

/** High-risk alerts list */
function HighRiskAlerts({ items }: { items: PredictionHistoryItem[] }) {
  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0', color: '#10b981', fontSize: '14px' }}>
        <CheckCircle size={32} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.6 }} />
        No recent high-risk predictions — looking great!
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.map(item => {
        const inp  = parseInput(item.input_data);
        const pct  = Math.round(item.delay_probability * 100);
        return (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '14px 16px',
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '12px',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(239,68,68,0.45)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(239,68,68,0.2)'; }}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
              background: 'linear-gradient(135deg,#ef4444,#dc2626)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(239,68,68,0.35)',
            }}>
              <AlertTriangle size={18} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#f1f5f9' }}>
                  {inp['Category Name'] ?? '–'} · {inp['Order City'] ?? inp['Market'] ?? '–'}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  via {inp['Shipping Mode'] ?? '–'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {new Date(item.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
            <div style={{
              fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: '800',
              color: '#ef4444', flexShrink: 0,
            }}>
              {pct}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 0', color: '#475569', fontSize: '13px' }}>
      {label}
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { showToast } = useToast();
  const [items,   setItems]   = useState<PredictionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await predictAPI.getHistory();
      setItems(data);
    } catch {
      showToast('error', 'Failed to load analytics', 'Could not fetch prediction history.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  const analytics = useMemo(() => computeAnalytics(items), [items]);

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div className="spinner spinner-lg" />
        <div style={{ color: '#64748b', fontSize: '14px' }}>Loading analytics…</div>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!analytics) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <Activity size={56} color="#1c2645" style={{ margin: '0 auto 20px' }} />
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: '700', color: '#475569', marginBottom: '10px' }}>
          No data yet
        </div>
        <div style={{ fontSize: '14px', color: '#475569', marginBottom: '24px' }}>
          Run some predictions first to see your analytics dashboard.
        </div>
        <a href="/predict" className="btn-primary" style={{ display: 'inline-flex' }}>
          <Zap size={15} /> Go to Predict
        </a>
      </div>
    );
  }

  const { total, low, medium, high, avgRisk, onTimeRate,
          trendDays, shippingBreakdown, marketRanking, categoryHeatmap, recentHighRisk } = analytics;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 72px' }}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b6ef8', boxShadow: '0 0 8px #3b6ef8' }} />
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Analytics</span>
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '30px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.025em', marginBottom: '6px' }}>
            Analytical Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Comprehensive supply chain risk intelligence — derived from {total} prediction{total !== 1 ? 's' : ''}.
          </p>
        </div>
        <button id="dashboard-refresh-btn" onClick={fetchData} className="btn-secondary" disabled={loading}>
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* ── KPI Strip ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <KpiCard
          icon={<TrendingUp size={17} color="#fff" />}
          label="Total Predictions"
          value={String(total)}
          sub="all time"
          color="#3b6ef8"
          gradient="linear-gradient(135deg,#3b6ef8,#6d4cf7)"
        />
        <KpiCard
          icon={<BarChart2 size={17} color="#fff" />}
          label="Avg Risk Score"
          value={`${Math.round(avgRisk * 100)}%`}
          sub="mean delay probability"
          color={avgRisk < 0.33 ? '#10b981' : avgRisk < 0.66 ? '#f59e0b' : '#ef4444'}
          gradient={avgRisk < 0.33 ? 'linear-gradient(135deg,#10b981,#059669)' : avgRisk < 0.66 ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#ef4444,#dc2626)'}
        />
        <KpiCard
          icon={<AlertTriangle size={17} color="#fff" />}
          label="High-Risk Orders"
          value={String(high)}
          sub={`${Math.round(high / total * 100)}% of total`}
          color="#ef4444"
          gradient="linear-gradient(135deg,#ef4444,#dc2626)"
        />
        <KpiCard
          icon={<CheckCircle size={17} color="#fff" />}
          label="On-Time Rate"
          value={`${Math.round(onTimeRate * 100)}%`}
          sub="predicted on-time deliveries"
          color="#10b981"
          gradient="linear-gradient(135deg,#10b981,#059669)"
        />
      </div>

      {/* ── Row 1: Donut + Trend ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,1fr) minmax(300px,2fr)', gap: '20px', marginBottom: '20px', alignItems: 'start' }}>
        <SectionCard title="Risk Distribution" icon={<Activity size={15} color="#93b4ff" />}>
          <DonutChart low={low} medium={medium} high={high} total={total} />
        </SectionCard>

        <SectionCard title="Risk Trend Over Time" icon={<TrendingUp size={15} color="#93b4ff" />}>
          <TrendChart days={trendDays} />
        </SectionCard>
      </div>

      {/* ── Row 2: Shipping + Market ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '20px', marginBottom: '20px' }}>
        <SectionCard title="Shipping Mode Delay Rate" icon={<Truck size={15} color="#93b4ff" />}>
          <ShippingBreakdown rows={shippingBreakdown} />
        </SectionCard>

        <SectionCard title="Top Markets by Risk" icon={<Globe size={15} color="#93b4ff" />}>
          <MarketRanking rows={marketRanking} />
        </SectionCard>
      </div>

      {/* ── Row 3: Category Heatmap ─────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <SectionCard title="Category Risk Heatmap" icon={<Package size={15} color="#93b4ff" />}>
          <CategoryHeatmap cats={categoryHeatmap} />
        </SectionCard>
      </div>

      {/* ── Row 4: Recent High-Risk Alerts ──────────────────────────────── */}
      <SectionCard title="Recent High-Risk Alerts" icon={<AlertTriangle size={15} color="#93b4ff" />}>
        <HighRiskAlerts items={recentHighRisk} />
      </SectionCard>

    </div>
  );
}
