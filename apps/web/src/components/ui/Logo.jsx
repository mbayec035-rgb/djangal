import { Link } from 'react-router-dom';
import { Braces } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export default function Logo({ compact = false, className = '', to = '/' }) {
  return (
    <Link to={to} className={cn('group inline-flex items-center gap-3', className)} aria-label="Djangue, accueil">
      <span className="relative grid h-9 w-9 shrink-0 place-items-center border border-neon/50 bg-[#0d1518] text-neon shadow-neon-sm transition group-hover:border-neon group-hover:shadow-neon-md">
        <Braces size={19} strokeWidth={1.8} />
        <span className="absolute -right-px -top-px h-1.5 w-1.5 bg-electric shadow-[0_0_8px_rgba(0,217,255,.8)]" />
      </span>
      {!compact && (
        <span className="font-display text-xl font-bold tracking-[-0.04em] text-white">
          Djangue<span className="text-neon">.</span>
        </span>
      )}
    </Link>
  );
}
