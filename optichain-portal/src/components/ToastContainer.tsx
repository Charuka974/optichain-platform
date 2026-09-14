import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import type { Toast } from '../types';

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const icons = {
    success: <CheckCircle size={18} color="#6ee7b7" />,
    error:   <XCircle    size={18} color="#fca5a5" />,
    info:    <Info       size={18} color="#93b4ff" />,
  };

  return (
    <div className={`toast toast-${toast.type}`} role="alert">
      <div style={{ flexShrink: 0, marginTop: 1 }}>{icons[toast.type]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="toast-title">{toast.title}</div>
        {toast.message && <div className="toast-message">{toast.message}</div>}
      </div>
      <button
        onClick={onRemove}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#64748b',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
