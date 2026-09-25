import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronRight, Command, Gauge, Layers3, LockKeyhole, MoveUpRight, ShieldCheck, Terminal, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { buttonStyles } from '../components/ui/Button.jsx';
import CourseCard from '../components/course/CourseCard.jsx';
import Typewriter from '../components/effects/Typewriter.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { api } from '../lib/api.js';

const capabilities = [
  { icon: Layers3, title: 'Parcours structurés', text: 'Des séquences courtes, ordonnées et directement liées aux pratiques professionnelles.' },
  { icon: Terminal, title: 'Laboratoires intégrés', text: 'Écrivez, modifiez et testez vos exemples directement dans chaque leçon.' },
  { icon: Gauge, title: 'Progression mesurable', text: 'Suivez chaque chapitre, chaque score et chaque évaluation dans un tableau de bord clair.' },
  { icon: ShieldCheck, title: 'Évaluations fiables', text: 'Les réponses sont corrigées côté serveur et votre historique reste consultable.' },
];

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get('/courses').then((data) => {
      if (active) setCourses(data.courses || []);
    }).catch(() => {}).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const primaryCta = '/tableau-de-bord';
  const primaryLabel = 'Ouvrir mon tableau de bord';
  const secondaryCta = '/catalogue';
  const secondaryLabel = 'Explorer les modules';

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 cyber-grid opacity-70" />
        <div className="absolute -right-40 top-12 h-[480px] w-[480px] rounded-full bg-neon/[0.045] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-electric/[0.035] blur-3xl" />
        <div className="page-shell relative grid min-h-[650px] items-center gap-14 py-20 lg:grid-cols-[1.08fr_.92fr] lg:py-28">
          <div>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <StatusBadge tone="success" icon="success">Système d’apprentissage actif</StatusBadge>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.55 }} className="mt-7 max-w-3xl font-display text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-6xl lg:text-[76px]">
                Apprendre à coder.<br />
                <span className="text-neon">Comprendre</span> le système.
              </motion.h1>
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.55 }} className="mt-7 max-w-xl text-base leading-7 text-muted sm:text-lg">
              Djangue transforme les concepts techniques en trajets concrets. HTML, programmation, modélisation et outils de delivery, avec une progression qui reste lisible.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.55 }} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to={primaryCta} className={buttonStyles({ size: 'lg' })}>{primaryLabel} <ArrowRight size={16} /></Link>
              <Link to={secondaryCta} className={buttonStyles({ variant: 'outline', size: 'lg' })}>{secondaryLabel}</Link>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#71808a]">
              <span className="flex items-center gap-2"><CheckCircle2 size={13} className="text-neon" /> 10 modules</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={13} className="text-electric" /> 30 chapitres</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={13} className="text-neon" /> Évaluations automatiques</span>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 26 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.65 }} className="relative hidden lg:block">
            <div className="absolute -inset-8 border border-neon/10" />
            <div className="relative border border-line bg-[#090d13] shadow-2xl">
              <div className="flex h-11 items-center justify-between border-b border-line px-5">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#aeb8be]"><Command size={14} className="text-neon" /> djangue / dashboard</div>
                <span className="font-mono text-[9px] text-neon">LIVE</span>
              </div>
              <div className="space-y-5 p-5 sm:p-6">
                <div className="flex items-end justify-between border-b border-line pb-5">
                  <div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Progression globale</p><p className="mt-1 font-display text-4xl font-semibold text-white">68<span className="text-neon">%</span></p></div>
                  <div className="text-right"><p className="font-mono text-[10px] uppercase tracking-wider text-muted">Rythme</p><p className="mt-1 flex items-center gap-1 font-mono text-xs text-neon"><Zap size={13} /> +12% cette semaine</p></div>
                </div>
                <div className="space-y-3">
                  {[['HTML', '92%', 'neon', 92], ['JavaScript', '74%', 'electric', 74], ['Mérise', '41%', 'neon', 41]].map(([label, value, color, width]) => (
                    <div key={label} className="grid grid-cols-[90px_1fr_35px] items-center gap-3 font-mono text-[10px]"><span className="text-[#aab4bb]">{label}</span><div className="h-1 bg-[#1a252d]"><motion.div initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ delay: 0.6, duration: 0.8 }} className={color === 'electric' ? 'h-full bg-electric shadow-[0_0_10px_rgba(0,217,255,.5)]' : 'h-full bg-neon shadow-[0_0_10px_rgba(0,255,157,.5)]'} /></div><span className={color === 'electric' ? 'text-electric' : 'text-neon'}>{value}</span></div>
                  ))}
                </div>
                <div className="border border-neon/20 bg-neon/[0.035] p-4">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-neon"><LockKeyhole size={13} /> Défi du jour</div>
                  <p className="mt-2 text-sm text-[#c9d2d7]">Valider un formulaire sans dépendance externe.</p>
                  <div className="mt-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-muted"><span className="h-1.5 w-1.5 bg-neon" /> HTML · 12 min</div>
                </div>
              </div>
              <div className="border-t border-line px-5 py-3 font-mono text-[9px] uppercase tracking-[0.12em] text-[#5f6d77]">last sync · à l’instant</div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-line bg-[#0c1117]">
        <div className="page-shell grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-4 sm:divide-y-0">
          {[['10', 'modules actifs'], ['30', 'chapitres guidés'], ['90+', 'questions disponibles'], ['100%', 'suivi persistant']].map(([value, label]) => (
            <div key={label} className="px-4 py-7 text-center sm:py-9"><p className="font-display text-3xl font-semibold text-white">{value}<span className="text-neon">+</span></p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">{label}</p></div>
          ))}
        </div>
      </section>

      <section className="page-shell py-20 sm:py-28">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div><p className="eyebrow mb-3">Catalogue initial</p><h2 className="section-title">Choisissez votre vecteur<br className="hidden sm:block" /> d’apprentissage.</h2></div>
          <Link to="/catalogue" className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neon transition hover:text-white">Voir tous les modules <ChevronRight size={15} /></Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-72 animate-pulse border border-line bg-surface" />) : courses.slice(0, 6).map((course, index) => <CourseCard key={course.id} course={course} index={index} />)}
        </div>
      </section>

      <section className="border-y border-line bg-[#0c1117]">
        <div className="page-shell grid gap-12 py-20 sm:py-24 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div><p className="eyebrow mb-3">Méthode Djangue</p><h2 className="section-title">Pas de raccourcis.<br />Des fondations.</h2><p className="mt-5 max-w-md text-sm leading-7 text-muted">Chaque concept passe par une lecture, un exemple, une manipulation et une vérification. Le format reste court, mais la progression est complète.</p><div className="mt-7 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-neon"><MoveUpRight size={15} /> Des compétences vérifiables</div></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {capabilities.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="cyber-card border border-line bg-surface p-5 transition hover:border-electric/45">
                <div className="flex items-start justify-between"><div className="grid h-9 w-9 place-items-center border border-line bg-[#0b1016] text-electric"><Icon size={18} /></div><span className="font-mono text-[10px] text-[#596872]">0{index + 1}</span></div>
                <h3 className="mt-7 font-display text-lg font-semibold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-20 sm:py-28">
        <div className="relative overflow-hidden border border-neon/35 bg-[#0b1516] p-8 sm:p-12">
          <div className="absolute inset-0 cyber-grid opacity-60" />
          <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(0,255,157,.12),transparent_65%)]" />
          <div className="relative max-w-2xl"><p className="eyebrow mb-3">Prêt à initialiser votre session</p><h2 className="font-display text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">Votre prochaine compétence commence par une première ligne de code.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-[#a5b5b7]">Aucun compte à créer : choisissez un module et avancez à votre rythme. Votre progression reste disponible à chaque visite.</p><Link to={primaryCta} className={buttonStyles({ size: 'lg', className: 'mt-7' })}>{primaryLabel} <ArrowRight size={16} /></Link></div>
        </div>
      </section>
    </div>
  );
}
