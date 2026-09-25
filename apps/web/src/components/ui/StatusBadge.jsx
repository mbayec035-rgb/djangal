import { Check, Clock3, LockKeyhole, ShieldCheck, X } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export default function StatusBadge({ children, tone = 'neutral', icon, className = '' }) {
  const tones = {
    neutral: 'border-line bg-raised text-[#a8b3bb]',
    success: 'border-neon/35 bg-neon/5 text-neon',
    info: 'border-electric/35 bg-electric/5 text-electric',
    danger: 'border-danger/40 bg-danger/5 text-danger',
    warning: 'border-warning/40 bg-warning/5 text-warning',
  };
  const icons = { success: Check, danger: X, info: ShieldCheck, warning: Clock3, lock: LockKeyhole };
  const Icon = icon ? icons[icon] : icons[tone];

  return (
    <span className={cn('inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.1em]', tones[tone], className)}>
      {Icon && <Icon size={11} />}
      {children}
    </span>
  );
}
