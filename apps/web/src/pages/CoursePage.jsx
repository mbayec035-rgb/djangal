import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, Clock3, FileCode2, FlaskConical, PlayCircle, RotateCcw, Target, Trophy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import Button, { buttonStyles } from '../components/ui/Button.jsx';
import CourseIcon from '../components/ui/CourseIcon.jsx';
import ChapterNav from '../components/course/ChapterNav.jsx';
import CodeLab from '../components/course/CodeLab.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { PageLoader } from '../components/ui/LoadingState.jsx';
import { api } from '../lib/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function CoursePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [activeChapterId, setActiveChapterId] = useState(searchParams.get('chapitre'));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get(`/courses/${slug}`).then((payload) => {
      if (!active) return;
      setData(payload);
      const requested = payload.chapters.find((chapter) => chapter.id === searchParams.get('chapitre'));
      const firstOpen = payload.chapters.find((chapter) => !chapter.completed);
      const next = requested || firstOpen || payload.chapters[0];
      setActiveChapterId(next?.id || null);
    }).catch((requestError) => active && setError(requestError.message)).finally(() => active && setLoading(false));
    return () => { active = false; };
  // The query is intentionally read only for the initial chapter selection.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const activeChapter = useMemo(() => data?.chapters.find((chapter) => chapter.id === activeChapterId) || data?.chapters[0], [activeChapterId, data]);

  if (loading) return <PageLoader label="Ouverture du module" />;
  if (error) return <div className="page-shell py-20"><div className="panel border-danger/40 p-6 text-sm text-danger">{error}</div></div>;
  if (!data?.course) return null;

  const { course, chapters } = data;
  const activeIndex = Math.max(0, chapters.findIndex((chapter) => chapter.id === activeChapter?.id));
  const isLast = activeIndex === chapters.length - 1;

  const selectChapter = (id) => {
    setActiveChapterId(id);
    setSearchParams({ chapitre: id }, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateProgress = async (completed) => {
    if (!activeChapter) return;
    if (!user) {
      navigate('/connexion', { state: { from: { pathname: `/cours/${slug}` } } });
      return;
    }
    setSaving(true);
    try {
      const result = await api.patch(`/courses/${course.id}/chapters/${activeChapter.id}/progress`, { completed });
      setData((current) => ({
        ...current,
        course: { ...current.course, progress: result.courseProgress, completedChapters: chapters.filter((chapter) => chapter.id === activeChapter.id ? Boolean(completed) : chapter.completed).length },
        chapters: current.chapters.map((chapter) => chapter.id === activeChapter.id ? { ...chapter, completed: Boolean(completed) } : chapter),
      }));
      toast.success(completed ? 'Chapitre marqué comme terminé.' : 'Chapitre remis en progression.');
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const goNext = () => {
    if (!isLast) selectChapter(chapters[activeIndex + 1].id);
  };

  return (
    <div className="page-shell py-8 sm:py-12">
      <div className="mb-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted"><Link to="/catalogue" className="transition hover:text-neon">Catalogue</Link><ChevronRight size={12} /><span className="text-[#c5ced3]">{course.technology}</span></div>

      <section className="relative overflow-hidden border border-line bg-surface p-6 sm:p-9">
        <div className="absolute inset-0 cyber-grid opacity-50" />
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(0,255,157,.10),transparent_65%)]" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-5"><div className="grid h-16 w-16 shrink-0 place-items-center border border-neon/40 bg-neon/5 text-neon sm:h-20 sm:w-20"><CourseIcon name={course.icon} size={31} /></div><div><div className="flex flex-wrap items-center gap-2"><p className="eyebrow">{course.technology} / module {String(course.orderIndex).padStart(2, '0')}</p><StatusBadge tone="info">{course.level}</StatusBadge></div><h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">{course.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{course.description}</p></div></div>
          <div className="w-full max-w-xs"><div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider"><span className="text-muted">Progression du module</span><span className="text-neon">{course.progress}%</span></div><ProgressBar value={course.progress} showValue /><div className="mt-3 flex items-center justify-between text-[10px] text-muted"><span>{course.completedChapters} / {chapters.length} chapitres</span><span className="flex items-center gap-1"><Clock3 size={12} /> {course.durationMinutes} min</span></div></div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[290px_1fr] xl:grid-cols-[320px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start"><ChapterNav chapters={chapters} activeId={activeChapter?.id} onSelect={selectChapter} /></aside>

        {activeChapter ? <main className="min-w-0">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow mb-2">Chapitre {String(activeIndex + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}</p><h2 className="font-display text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">{activeChapter.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{activeChapter.summary}</p></div><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted"><Clock3 size={14} /> {activeChapter.durationMinutes} min de lecture</div></div>

          <article className="border border-line bg-surface p-5 sm:p-8"><ReactMarkdown remarkPlugins={[remarkGfm]} className="prose-django">{activeChapter.content}</ReactMarkdown></article>

          <div className="mt-6"><CodeLab chapter={activeChapter} /></div>

          <section className="mt-6 grid gap-4 border border-line bg-[#0c1117] p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
            <div className="flex items-start gap-3"><div className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center border ${activeChapter.completed ? 'border-neon/40 bg-neon/5 text-neon' : 'border-line bg-surface text-electric'}`}>{activeChapter.completed ? <Check size={17} /> : <Target size={17} />}</div><div><h3 className="font-display text-lg font-semibold text-white">{activeChapter.completed ? 'Chapitre validé' : 'Avez-vous terminé ce chapitre ?'}</h3><p className="mt-1 text-sm leading-6 text-muted">Marquez votre progression pour la retrouver dans votre tableau de bord.</p></div></div>
            <Button variant={activeChapter.completed ? 'outline' : 'primary'} onClick={() => updateProgress(!activeChapter.completed)} loading={saving}>{activeChapter.completed ? <><RotateCcw size={14} /> Revenir en cours</> : <><Check size={14} /> Marquer comme terminé</>}</Button>
          </section>

          {activeChapter.quiz && <section className="mt-6 flex flex-col gap-5 border border-electric/30 bg-electric/[0.035] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center border border-electric/30 bg-electric/5 text-electric"><FlaskConical size={17} /></div><div><p className="font-mono text-[10px] uppercase tracking-[0.13em] text-electric">Évaluation du chapitre</p><h3 className="mt-1 font-display text-lg font-semibold text-white">Testez vos acquis</h3><p className="mt-1 text-sm text-muted">Correction automatique · seuil de réussite 70 %</p></div></div><Link to={`/quiz/${activeChapter.quiz.id}`} className={buttonStyles({ variant: 'secondary' })}>Lancer le quiz <ArrowRight size={15} /></Link></section>}

          <div className="mt-8 flex flex-col justify-between gap-3 border-t border-line pt-6 sm:flex-row"><button type="button" disabled={activeIndex === 0} onClick={() => selectChapter(chapters[activeIndex - 1].id)} className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider transition ${activeIndex === 0 ? 'cursor-not-allowed text-[#45535d]' : 'text-muted hover:text-white'}`}><ArrowLeft size={14} /> Chapitre précédent</button><button type="button" disabled={isLast} onClick={goNext} className={`inline-flex items-center justify-end gap-2 font-mono text-[10px] uppercase tracking-wider transition ${isLast ? 'cursor-not-allowed text-[#45535d]' : 'text-neon hover:text-white'}`}>Chapitre suivant <ArrowRight size={14} /></button></div>
        </main> : <div className="panel p-8 text-sm text-muted">Ce module ne contient pas encore de chapitre.</div>}
      </div>

      {course.finalQuiz && <section className="mt-8 border border-neon/30 bg-[#0b1516] p-6 sm:p-8"><div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center"><div className="flex items-start gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center border border-neon/40 bg-neon/5 text-neon"><Trophy size={22} /></div><div><p className="eyebrow mb-2">Dernière étape</p><h2 className="font-display text-2xl font-semibold text-white">Évaluation finale du module</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted">Validez l’ensemble des notions pour obtenir votre badge de module et votre certificat.</p></div></div><Link to={`/quiz/${course.finalQuiz.id}`} className={buttonStyles({ size: 'lg' })}><PlayCircle size={16} /> Lancer l’évaluation</Link></div></section>}
    </div>
  );
}
