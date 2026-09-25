import { LoaderCircle } from 'lucide-react';
import { cn } from '../../lib/utils.js';

const variants = {
  primary: 'border-neon/70 bg-neon text-[#06110c] hover:bg-[#18ffac] hover:shadow-neon-md',
  secondary: 'border-electric/55 bg-[#0d1a1e] text-electric hover:border-electric hover:bg-[#10252b] hover:shadow-cyan-sm',
  outline: 'border-line bg-transparent text-[#d6dde1] hover:border-neon/60 hover:text-neon',
  ghost: 'border-transparent bg-transparent text-muted hover:bg-raised hover:text-white',
  danger: 'border-danger/60 bg-danger/10 text-danger hover:bg-danger hover:text-white',
};

export function buttonStyles({ variant = 'primary', size = 'md', className = '' } = {}) {
  const sizes = {
    sm: 'h-9 px-3.5 text-xs',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-sm',
  };
  return cn(
    'group relative inline-flex items-center justify-center gap-2 overflow-hidden border font-mono text-xs font-semibold uppercase tracking-[0.08em] transition duration-200 disabled:pointer-events-none disabled:opacity-50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-void',
    variants[variant],
    sizes[size],
    variant === 'primary' && 'hover:animate-glow-pulse',
    className,
  );
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  type = 'button',
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoaderCircle size={15} className="animate-spin" />}
      {children}
    </button>
  );
}
