import { Check, FileText, PlayCircle } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export default function ChapterNav({ chapters, activeId, onSelect }) {
  return (
    <div className="border border-line bg-surface">
      <div className="border-b border-line px-4 py-3">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#b9c3c9]">Parcours du module</p>
      </div>
      <div className="divide-y divide-line/70">
        {chapters.map((chapter, index) => {
          const active = chapter.id === activeId;
          return (
            <button key={chapter.id} type="button" onClick={() => onSelect(chapter.id)} className={cn('group flex w-full items-start gap-3 px-4 py-4 text-left transition', active ? 'bg-neon/[0.055]' : 'hover:bg-raised')}>
              <span className={cn('mt-0.5 grid h-5 w-5 shrink-0 place-items-center border font-mono text-[9px] transition', chapter.completed ? 'border-neon bg-neon text-[#06110c]' : active ? 'border-neon text-neon' : 'border-[#34434e] text-muted')}>
                {chapter.completed ? <Check size={12} strokeWidth={3} /> : String(index + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn('block text-sm font-medium leading-5 transition', active ? 'text-neon' : 'text-[#cbd3d8] group-hover:text-white')}>{chapter.title}</span>
                <span className="mt-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
                  {chapter.completed ? 'Terminé' : 'À parcourir'} <span className="h-px w-2 bg-line" /> {chapter.durationMinutes} min
                </span>
              </span>
              {chapter.quiz && <PlayCircle size={14} className={cn('mt-1 shrink-0', chapter.quiz.bestAttempt?.passed ? 'text-neon' : 'text-[#52616c]')} />}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 border-t border-line px-4 py-3 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
        <FileText size={12} /> {chapters.length} chapitres
      </div>
    </div>
  );
}
