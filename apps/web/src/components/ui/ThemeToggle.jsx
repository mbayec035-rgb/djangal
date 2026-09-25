import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { cn } from '../../lib/utils.js';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn('grid h-10 w-10 place-items-center border border-line bg-surface text-muted transition hover:border-neon/60 hover:text-neon', className)}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
