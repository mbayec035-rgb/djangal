import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Clock3, Flag, RotateCcw, Send, ShieldCheck, Trophy, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button, { buttonStyles } from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { PageLoader } from '../components/ui/LoadingState.jsx';
import { api } from '../lib/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { formatDate } from '../lib/utils.js';

const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`;
}

export default function QuizPage() {
  const { quizId } = useParams();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [seconds, setSeconds] = useState(10 * 60);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get(`/quizzes/${quizId}`).then((payload) => active && setData(payload)).catch((requestError) => active && setError(requestError.message)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [quizId]);

  useEffect(() => {
    if (result || loading) return undefined;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [loading, result]);

  const quiz = data?.quiz;
  const question = quiz?.questions[index];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = quiz?.questions?.every((item) => answers[item.id] !== undefined);
  const courseLink = quiz?.courseSlug ? `/cours/${quiz.courseSlug}` : '/tableau-de-bord';

  const selectAnswer = (value) => {
    setAnswers((current) => ({ ...current, [question.id]: value }));
  };

  const submit = async () => {
    if (!allAnswered) {
      toast.info('Répondez à toutes les questions avant de valider.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = await api.post(`/quizzes/${quiz.id}/attempts`, { answers });
      setResult(payload);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader label="Chargement de l’évaluation" />;
  if (error || !quiz) return <div className="page-shell py-20"><div className="panel border-danger/40 p-6 text-sm text-danger">{error || 'Quiz introuvable.'}</div></div>;

  if (result) {
    const { attempt, certificate } = result;
    return (
      <div className="page-shell py-12 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className={`relative overflow-hidden border p-7 text-center sm:p-12 ${attempt.passed ? 'border-neon/40 bg-[#0b1516]' : 'border-danger/40 bg-[#161015]'}`}>
            <div className="absolute inset-0 cyber-grid opacity-45" />
            <div className="relative mx-auto grid h-16 w-16 place-items-center border border-neon/40 bg-neon/5 text-neon shadow-neon-md"><Trophy size={30} /></div>
            <p className="eyebrow relative mt-6">{attempt.passed ? 'Validation enregistrée' : 'Poursuite recommandée'}</p>
            <h1 className="relative mt-3 font-display text-4xl font-semibold tracking-[-0.05em] text-white">{attempt.score}<span className="text-neon">%</span></h1>
            <p className="relative mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">{attempt.passed ? `Félicitations, le seuil de ${attempt.passScore}% est atteint. Votre résultat est ajouté à votre historique.` : `Le seuil de réussite est de ${attempt.passScore}%. Relisez les explications puis retentez le quiz.`}</p>
            <div className="relative mx-auto mt-7 grid max-w-md grid-cols-3 border border-line bg-[#0b1016]"><div className="border-r border-line p-4"><p className="font-display text-xl font-semibold text-white">{attempt.correctCount}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted">Bonnes</p></div><div className="border-r border-line p-4"><p className="font-display text-xl font-semibold text-white">{attempt.total - attempt.correctCount}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted">À revoir</p></div><div className="p-4"><p className="font-display text-xl font-semibold text-neon">{attempt.passScore}%</p><p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted">Seuil</p></div></div>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to={courseLink} className={buttonStyles({ variant: 'outline' })}><ArrowLeft size={15} /> Retour au module</Link><Link to="/tableau-de-bord" className={buttonStyles()}>Voir ma progression <ArrowRight size={15} /></Link></div>
          </div>

          {certificate && <div className="mt-6 flex flex-col items-start justify-between gap-4 border border-neon/35 bg-neon/[0.04] p-5 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center border border-neon/40 text-neon"><Trophy size={18} /></div><div><p className="font-mono text-[10px] uppercase tracking-[0.13em] text-neon">Certificat généré</p><p className="mt-1 text-sm text-white">{certificate.courseTitle}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted">ID {certificate.id}</p></div></div><StatusBadge tone="success" icon="success">Djangue Verified</StatusBadge></div>}

          <div className="mt-8 border border-line bg-surface"><div className="border-b border-line px-5 py-4"><h2 className="font-display text-lg font-semibold text-white">Détail des réponses</h2></div><div className="divide-y divide-line/70">{attempt.results.map((item, questionIndex) => <div key={item.questionId} className="flex gap-4 p-5"><div className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center border ${item.correct ? 'border-neon/40 bg-neon/5 text-neon' : 'border-danger/40 bg-danger/5 text-danger'}`}>{item.correct ? <Check size={13} /> : <X size={13} />}</div><div><p className="text-sm leading-6 text-[#d5dde1]"><span className="mr-2 font-mono text-[10px] text-muted">{String(questionIndex + 1).padStart(2, '0')}</span>{quiz.questions[questionIndex]?.prompt}</p><p className="mt-2 text-xs leading-5 text-muted">{item.explanation}</p></div></div>)}</div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-end"><div><Link to={courseLink} className="mb-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted transition hover:text-neon"><ArrowLeft size={14} /> Quitter l’évaluation</Link><p className="eyebrow mb-2">{quiz.kind === 'module' ? 'Évaluation finale' : 'Quiz de chapitre'}</p><h1 className="font-display text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">{quiz.title}</h1></div><div className={`flex items-center gap-2 border px-3 py-2 font-mono text-xs ${seconds < 120 ? 'border-danger/50 bg-danger/5 text-danger' : 'border-line bg-surface text-[#c4cdd2]'}`}><Clock3 size={15} /> {formatTime(seconds)}</div></div>

        <div className="mb-7"><div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted"><span>Question {String(index + 1).padStart(2, '0')} / {String(quiz.questions.length).padStart(2, '0')}</span><span>{answeredCount} réponse(s) enregistrée(s)</span></div><div className="h-1 bg-[#1a252d]"><motion.div className="h-full bg-neon shadow-[0_0_12px_rgba(0,255,157,.55)]" animate={{ width: `${((index + 1) / quiz.questions.length) * 100}%` }} /></div></div>

        <AnimatePresence mode="wait">
          <motion.section key={question.id} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.22 }} className="border border-line bg-surface p-5 sm:p-8">
            <div className="flex items-start justify-between gap-4"><div><StatusBadge tone={question.type === 'boolean' ? 'info' : 'success'}>{question.type === 'boolean' ? 'Vrai / Faux' : 'QCM'}</StatusBadge><h2 className="mt-5 max-w-2xl break-words font-display text-2xl font-semibold leading-tight tracking-[-0.03em] text-white">{question.prompt}</h2></div><span className="font-mono text-[10px] text-muted">Q{String(index + 1).padStart(2, '0')}</span></div>
            <div className="mt-8 space-y-3">{question.options.map((option, optionIndex) => { const selected = answers[question.id] === optionIndex; return <button key={option} type="button" onClick={() => selectAnswer(optionIndex)} className={`group flex w-full items-center gap-4 border p-4 text-left transition ${selected ? 'border-neon bg-neon/[0.06] shadow-neon-sm' : 'border-line bg-[#0c1118] hover:border-electric/55 hover:bg-raised'}`}><span className={`grid h-8 w-8 shrink-0 place-items-center border font-mono text-[11px] font-semibold transition ${selected ? 'border-neon bg-neon text-[#06110c]' : 'border-[#35434e] text-muted group-hover:border-electric group-hover:text-electric'}`}>{optionLetters[optionIndex]}</span><span className={`break-words text-sm leading-5 ${selected ? 'text-white' : 'text-[#bcc6cc] group-hover:text-white'}`}>{option}</span>{selected && <Check size={16} className="ml-auto shrink-0 text-neon" />}</button>; })}</div>
          </motion.section>
        </AnimatePresence>

        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><button type="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0} className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider transition ${index === 0 ? 'cursor-not-allowed text-[#46545e]' : 'text-muted hover:text-white'}`}><ArrowLeft size={14} /> Précédente</button><div className="flex items-center gap-2">{index < quiz.questions.length - 1 ? <Button onClick={() => setIndex((value) => value + 1)} disabled={answers[question.id] === undefined}>Suivante <ArrowRight size={15} /></Button> : <Button onClick={submit} loading={submitting}><Send size={14} /> Valider mes réponses</Button>}</div></div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2"><div className="border border-line bg-[#0c1117] p-4"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-neon"><ShieldCheck size={14} /> Correction serveur</div><p className="mt-2 text-xs leading-5 text-muted">Les bonnes réponses et les explications s’afficheront après la validation.</p></div><div className="border border-line bg-[#0c1117] p-4"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-electric"><Flag size={14} /> Seuil de réussite</div><p className="mt-2 text-xs leading-5 text-muted">Un score de {quiz.passScore}% est requis pour valider cette évaluation.</p></div></div>
        {quiz.history?.length > 0 && <div className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted"><RotateCcw size={13} /> {quiz.history.length} tentative(s) précédente(s) · dernière le {formatDate(quiz.history[0].createdAt)}</div>}
      </div>
    </div>
  );
}
