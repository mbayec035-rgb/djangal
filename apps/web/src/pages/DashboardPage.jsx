import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BarChart3, BookOpen, CheckCircle2, CircleAlert, Clock3, Flame, Gauge, Layers3, Play, ShieldCheck, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Button, { buttonStyles } from '../components/ui/Button.jsx';
import CourseIcon from '../components/ui/CourseIcon.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { PageLoader } from '../components/ui/LoadingState.jsx';
import { api } from '../lib/api.js';
import { formatRelativeDate, initials } from '../lib/utils.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';

function ProgressRing({ value }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const safeValue = Math.max(0, Math.min(100, value || 0));
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#1d2932" strokeWidth="7" />
        <motion.circle cx="50" cy="50" r={radius} fill="none" stroke="#00ff9d" strokeWidth="7" strokeLinecap="square" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: circumference - (safeValue / 100) * circumference }} transition={{ duration: 1.1, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center"><span className="font-display text-2xl font-semibold text-white">{safeValue}<small className="text-sm text-neon">%</small></span></div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail, tone = 'neon' }) {
  const isCyan = tone === 'electric';
  return <div className="panel flex items-start gap-4 p-5"><div className={`grid h-10 w-10 shrink-0 place-items-center border ${isCyan ? 'border-electric/30 bg-electric/5 text-electric' : 'border-neon/30 bg-neon/5 text-neon'}`}><Icon size={18} /></div><div className="min-w-0"><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">{label}</p><p className="mt-1 font-display text-2xl font-semibold text-white">{value}</p><p className="mt-1 truncate text-xs text-muted">{detail}</p></div></div>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/dashboard').then((payload) => active && setData(payload)).catch((requestError) => active && setError(requestError.message)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  if (loading) return <PageLoader label="Synchronisation de votre progression" />;
  if (error) return <div className="page-shell py-20"><div className="panel flex items-center gap-3 border-danger/40 p-5 text-sm text-danger"><CircleAlert size={18} />{error}</div></div>;

  const { summary, continueCourse, courses, recentAttempts, certificates } = data;
  const firstName = user.name.split(' ')[0];
  const startedCourses = courses.filter((course) => course.progress > 0);
  const completedCourses = courses.filter((course) => course.progress === 100);

  return (
    <div className="page-shell py-10 sm:py-14">
      <section className="relative overflow-hidden border border-line bg-surface p-6 sm:p-9">
        <div className="absolute inset-0 cyber-grid opacity-50" />
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(0,217,255,.10),transparent_65%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            {user.avatar ? <img src={user.avatar} alt="" className="h-16 w-16 border border-neon/50 object-cover sm:h-20 sm:w-20" /> : <div className="grid h-16 w-16 place-items-center border border-neon/40 bg-neon/5 font-mono text-xl font-semibold text-neon sm:h-20 sm:w-20">{initials(user.name)}</div>}
            <div><p className="eyebrow mb-2">Session active / {user.role === 'admin' ? 'administrateur' : 'étudiant'}</p><h1 className="font-display text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">Bonjour, {firstName}<span className="text-neon">.</span></h1><p className="mt-2 text-sm text-muted">Votre espace de progression est synchronisé.</p></div>
          </div>
          <div className="flex items-center gap-5 rounded-none border border-line bg-[#0b1016] px-5 py-4"><ProgressRing value={summary.progress} /><div><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Progression globale</p><p className="mt-1 font-display text-2xl font-semibold text-white">{summary.completedChapters}<span className="text-muted"> / {summary.totalChapters}</span></p><p className="mt-1 text-xs text-muted">chapitres terminés</p></div></div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Layers3} label="Modules commencés" value={startedCourses.length} detail={`sur ${summary.totalCourses} disponibles`} />
        <StatCard icon={CheckCircle2} label="Modules terminés" value={completedCourses.length} detail="objectifs de chapters" tone="electric" />
        <StatCard icon={Trophy} label="Quiz réussis" value={summary.passedAttempts} detail={`${summary.totalAttempts} évaluations passées`} />
        <StatCard icon={Award} label="Certificats" value={certificates.length} detail="badges de module" tone="electric" />
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <div className="panel">
          <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6"><div><p className="eyebrow mb-1">Reprendre</p><h2 className="font-display text-xl font-semibold text-white">Continuez là où vous vous êtes arrêté.</h2></div><Link to="/catalogue" className="hidden font-mono text-[10px] uppercase tracking-wider text-neon sm:block">Tous les modules</Link></div>
          {continueCourse ? <div className="p-5 sm:p-6"><div className="flex flex-col gap-6 sm:flex-row sm:items-center"><div className="grid h-16 w-16 shrink-0 place-items-center border border-neon/40 bg-neon/5 text-neon"><CourseIcon name={continueCourse.icon} size={27} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neon">{continueCourse.technology}</p><span className="h-px w-4 bg-line" /><span className="font-mono text-[10px] text-muted">{continueCourse.completedChapters}/{continueCourse.totalChapters} chapitres</span></div><h3 className="mt-2 font-display text-2xl font-semibold text-white">{continueCourse.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{continueCourse.shortDescription}</p><ProgressBar value={continueCourse.progress} className="mt-5" showValue accent="neon" /></div><Link to={`/cours/${continueCourse.slug}`} className={buttonStyles({ variant: 'outline', className: 'shrink-0' })}><Play size={14} /> Continuer</Link></div></div> : <div className="p-8 text-center"><p className="text-sm text-muted">Votre parcours est prêt à démarrer.</p><Link to="/catalogue" className={buttonStyles({ className: 'mt-5' })}>Choisir un module <ArrowRight size={15} /></Link></div>}
        </div>

        <div className="panel">
          <div className="flex items-center justify-between border-b border-line px-5 py-4"><div><p className="eyebrow mb-1">Signal</p><h2 className="font-display text-xl font-semibold text-white">Activité récente</h2></div><BarChart3 size={18} className="text-electric" /></div>
          <div className="divide-y divide-line/70">
            {recentAttempts.length ? recentAttempts.slice(0, 4).map((attempt) => <Link to={`/quiz/${attempt.quizId}`} key={attempt.id} className="flex items-center gap-3 px-5 py-4 transition hover:bg-raised"><div className={`grid h-8 w-8 shrink-0 place-items-center border ${attempt.passed ? 'border-neon/30 bg-neon/5 text-neon' : 'border-danger/30 bg-danger/5 text-danger'}`}><span className="font-mono text-[10px] font-semibold">{attempt.score}</span></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-[#d5dde1]">{attempt.title}</p><p className="mt-1 truncate font-mono text-[9px] uppercase tracking-wider text-muted">{attempt.courseTitle} · {formatRelativeDate(attempt.createdAt)}</p></div><span className={`font-mono text-[9px] uppercase tracking-wider ${attempt.passed ? 'text-neon' : 'text-danger'}`}>{attempt.passed ? 'OK' : 'À revoir'}</span></Link>) : <div className="px-5 py-10 text-center"><Clock3 size={20} className="mx-auto text-muted" /><p className="mt-3 text-sm text-muted">Aucune évaluation pour le moment.</p></div>}
          </div>
          <Link to="/profil" className="flex items-center justify-center gap-2 border-t border-line px-5 py-3.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted transition hover:text-neon">Voir l’historique <ArrowRight size={13} /></Link>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4"><div><p className="eyebrow mb-1">Cartographie</p><h2 className="font-display text-2xl font-semibold text-white">Progression par module</h2></div><span className="font-mono text-[10px] uppercase tracking-wider text-muted">{summary.progress}% global</span></div>
        <div className="grid gap-3 md:grid-cols-2">
          {courses.map((course) => <Link key={course.id} to={`/cours/${course.slug}`} className="cyber-card group border border-line bg-surface p-4 transition hover:border-neon/45"><div className="flex items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center border border-line bg-[#0b1016]" style={{ color: course.accent }}><CourseIcon name={course.icon} size={17} /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-medium text-[#dbe2e5] group-hover:text-white">{course.title}</p><span className="font-mono text-[10px] text-neon">{course.progress}%</span></div><div className="mt-2"><ProgressBar value={course.progress} accent={course.accent === '#00d9ff' ? 'electric' : 'neon'} /></div></div><ArrowRight size={15} className="shrink-0 text-[#53636e] transition group-hover:translate-x-1 group-hover:text-neon" /></div></Link>)}
        </div>
      </section>

      {certificates.length > 0 && <section className="mt-10 border border-neon/25 bg-neon/[0.025] p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="eyebrow mb-1">Badges obtenus</p><h2 className="font-display text-xl font-semibold text-white">Vos certifications de module</h2></div><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-neon"><ShieldCheck size={14} /> {certificates.length} vérifiée(s)</div></div><div className="mt-5 flex flex-wrap gap-2">{certificates.map((certificate) => <span key={certificate.id} className="inline-flex items-center gap-2 border border-neon/30 bg-neon/5 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-neon"><Award size={13} /> {certificate.courseTitle}</span>)}</div></section>}
    </div>
  );
}
