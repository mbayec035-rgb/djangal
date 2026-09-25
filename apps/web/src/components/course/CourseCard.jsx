import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock3, Layers3, LockKeyhole, PlayCircle } from 'lucide-react';
import CourseIcon from '../ui/CourseIcon.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { cn } from '../../lib/utils.js';

export default function CourseCard({ course, index = 0, locked = false }) {
  const progress = Number(course.progress || 0);
  const isStarted = progress > 0 && progress < 100;
  const isComplete = progress === 100;

  return (
    <Link to={locked ? '#' : `/cours/${course.slug}`} onClick={(event) => locked && event.preventDefault()} className={cn('cyber-card group flex h-full flex-col border border-line bg-surface p-5 transition duration-300 hover:-translate-y-1 hover:border-neon/55 hover:shadow-neon-sm', locked && 'cursor-not-allowed opacity-55 hover:translate-y-0')}>
      <div className="mb-7 flex items-start justify-between gap-4">
        <div className="grid h-11 w-11 place-items-center border border-line bg-[#0b1016] transition group-hover:border-neon/50" style={{ color: course.accent || '#00ff9d' }}>
          <CourseIcon name={course.icon} size={21} />
        </div>
        <span className="font-mono text-[10px] text-[#596771]">0{index + 1}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: course.accent || '#00ff9d' }}>{course.technology}</p>
          <span className="h-px w-4 bg-line" />
          <span className="font-mono text-[10px] text-muted">{course.level}</span>
        </div>
        <h3 className="mt-2.5 font-display text-xl font-semibold tracking-[-0.03em] text-white transition group-hover:text-neon">{course.title}</h3>
        <p className="mt-2.5 line-clamp-2 text-sm leading-6 text-muted">{course.shortDescription || course.description}</p>
      </div>

      <div className="mt-7">
        {locked ? (
          <StatusBadge tone="neutral" icon="lock">Bientôt disponible</StatusBadge>
        ) : progress > 0 ? (
          <>
            <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em]">
              <span className="text-muted">{isComplete ? 'Module terminé' : 'Progression'}</span>
              <span className="text-neon">{progress}%</span>
            </div>
            <ProgressBar value={progress} accent={course.accent === '#00d9ff' ? 'electric' : 'neon'} />
          </>
        ) : (
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
            <span className="flex items-center gap-1.5"><Layers3 size={13} /> {course.totalChapters || 3} chapitres</span>
            <span className="flex items-center gap-1.5"><Clock3 size={13} /> {course.durationMinutes || 120} min</span>
          </div>
        )}
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[#89969f] transition group-hover:text-white">
            {locked ? <LockKeyhole size={13} /> : isStarted ? <PlayCircle size={13} /> : <ArrowUpRight size={13} />}
            {locked ? 'Verrouillé' : isStarted ? 'Continuer' : 'Ouvrir le module'}
          </span>
          {isComplete && <span className="font-mono text-[9px] uppercase tracking-wider text-neon">Validé</span>}
        </div>
      </div>
    </Link>
  );
}
