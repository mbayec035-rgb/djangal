import { useEffect, useMemo, useState } from 'react';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import CourseCard from '../components/course/CourseCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { PageLoader } from '../components/ui/LoadingState.jsx';
import Button from '../components/ui/Button.jsx';
import { api } from '../lib/api.js';

export default function CatalogPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('Tous les niveaux');
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    let active = true;
    api.get('/courses').then((data) => active && setCourses(data.courses || [])).catch(() => {}).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => courses.filter((course) => {
    const search = query.trim().toLowerCase();
    const matchesQuery = !search || [course.title, course.technology, course.description, course.shortDescription].join(' ').toLowerCase().includes(search);
    const matchesLevel = level === 'Tous les niveaux' || course.level === level;
    return matchesQuery && matchesLevel;
  }), [courses, level, query]);

  const reset = () => { setQuery(''); setLevel('Tous les niveaux'); };

  return (
    <div className="page-shell py-14 sm:py-20">
      <div className="flex flex-col justify-between gap-8 border-b border-line pb-10 lg:flex-row lg:items-end">
        <div><p className="eyebrow mb-3">Djangue / catalogue</p><h1 className="section-title">Choisissez un module.<br />Construisez une base solide.</h1><p className="mt-5 max-w-xl text-sm leading-7 text-muted">Dix technologies et méthodes, une même logique : comprendre, expérimenter, évaluer.</p></div>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted"><span className="grid h-9 w-9 place-items-center border border-line bg-surface text-neon"><Filter size={15} /></span>{courses.length} modules disponibles</div>
      </div>

      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md"><Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="input-base pl-10" placeholder="Rechercher un langage, une méthode..." aria-label="Rechercher dans le catalogue" /></div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setMobileFilters((value) => !value)} className="inline-flex h-11 items-center gap-2 border border-line bg-surface px-4 font-mono text-[10px] uppercase tracking-wider text-[#b2bdc3] lg:hidden"><SlidersHorizontal size={15} /> Filtres</button>
          <div className={`${mobileFilters ? 'flex' : 'hidden'} flex-wrap gap-2 lg:flex`}>
            {['Tous les niveaux', 'Débutant', 'Intermédiaire', 'Avancé'].map((option) => <button type="button" key={option} onClick={() => setLevel(option)} className={`h-10 border px-3.5 font-mono text-[10px] uppercase tracking-wider transition ${level === option ? 'border-neon/60 bg-neon/[0.06] text-neon' : 'border-line bg-surface text-muted hover:border-[#3a4b57] hover:text-white'}`}>{option}</button>)}
          </div>
        </div>
      </div>

      {loading ? <PageLoader label="Indexation des modules" /> : filtered.length ? <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((course, index) => <CourseCard key={course.id} course={course} index={index} />)}</div> : <div className="mt-10"><EmptyState icon={X} title="Aucun module trouvé" description="Modifiez votre recherche ou réinitialisez les filtres pour afficher le catalogue complet." actionLabel="Réinitialiser" onAction={reset} /></div>}
    </div>
  );
}
