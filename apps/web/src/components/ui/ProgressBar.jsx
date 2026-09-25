import { motion } from 'framer-motion';
import { cn } from '../../lib/utils.js';

export default function ProgressBar({ value = 0, label, showValue = false, accent = 'neon', className = '' }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const barColor = accent === 'electric' ? 'bg-electric shadow-[0_0_14px_rgba(0,217,255,.55)]' : 'bg-neon shadow-[0_0_14px_rgba(0,255,157,.55)]';

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
          {label && <span>{label}</span>}
          {showValue && <span className="text-[#d8e0e4]">{safeValue}%</span>}
        </div>
      )}
      <div
        className="h-1.5 overflow-hidden border border-[#1d2932] bg-[#080b0f]"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={safeValue}
        aria-label={label || 'Progression'}
      >
        <motion.div
          className={cn('h-full origin-left', barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${safeValue}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
