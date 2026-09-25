import { LoaderCircle } from 'lucide-react';

export function PageLoader({ label = 'Chargement des données' }) {
  return (
    <div className="grid min-h-[55vh] place-items-center px-4 py-20">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative grid h-12 w-12 place-items-center border border-line bg-surface text-neon">
          <LoaderCircle size={21} className="animate-spin" />
          <span className="absolute inset-x-0 top-0 h-px animate-pulse bg-neon" />
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#b1bcc3]">{label}</p>
          <p className="mt-1 font-mono text-[10px] text-muted">chargement local</p>
        </div>
      </div>
    </div>
  );
}

export function InlineLoader() {
  return <LoaderCircle size={16} className="animate-spin" />;
}
