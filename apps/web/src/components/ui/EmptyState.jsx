import { Terminal } from 'lucide-react';
import { buttonStyles } from './Button.jsx';

export default function EmptyState({ title, description, actionLabel, onAction, icon: Icon = Terminal }) {
  return (
    <div className="panel relative flex min-h-72 flex-col items-center justify-center overflow-hidden px-6 py-12 text-center">
      <div className="absolute inset-0 dot-grid opacity-25" />
      <div className="relative grid h-12 w-12 place-items-center border border-line bg-[#0c1118] text-neon">
        <Icon size={22} />
      </div>
      <h3 className="relative mt-5 font-display text-lg font-semibold text-white">{title}</h3>
      <p className="relative mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {actionLabel && (
        <button type="button" onClick={onAction} className={buttonStyles({ variant: 'outline', className: 'relative mt-6' })}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
