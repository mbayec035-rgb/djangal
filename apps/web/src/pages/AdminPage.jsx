import { useEffect, useState } from 'react';
import { BookPlus, Edit3, Eye, EyeOff, FilePlus2, Layers3, Plus, Settings2, Trash2, X } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import CourseIcon from '../components/ui/CourseIcon.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { PageLoader } from '../components/ui/LoadingState.jsx';
import { api } from '../lib/api.js';
import { useToast } from '../contexts/ToastContext.jsx';

const emptyCourse = { title: '', technology: '', shortDescription: '', description: '', level: 'Débutant', durationMinutes: 120, icon: 'code-2', accent: '#00ff9d', published: true };
const emptyChapter = { title: '', summary: '', content: '', code: '', language: 'text', durationMinutes: 30 };

export default function AdminPage() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [chapterForm, setChapterForm] = useState(emptyChapter);
  const [courseDetail, setCourseDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingChapter, setSavingChapter] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(false);

  const loadCourses = () => api.get('/admin/courses').then((data) => setCourses(data.courses || []));

  useEffect(() => {
    loadCourses().catch((error) => toast.error(error.message)).finally(() => setLoading(false));
    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) { setCourseDetail(null); return; }
    api.get(`/admin/courses/${selected.id}`).then((data) => setCourseDetail(data)).catch((error) => toast.error(error.message));
    // Detail is refreshed when the selected module changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const editCourse = (course) => {
    setSelected(course);
    setCourseForm({ title: course.title, technology: course.technology, shortDescription: course.shortDescription, description: course.description, level: course.level, durationMinutes: course.durationMinutes, icon: course.icon, accent: course.accent, published: course.published });
    setShowCourseForm(true);
  };

  const resetCourseForm = () => { setSelected(null); setCourseForm(emptyCourse); setShowCourseForm(false); setShowChapterForm(false); };

  const updateCourseField = (event) => setCourseForm((current) => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  const saveCourse = async (event) => {
    event.preventDefault();
    setSavingCourse(true);
    try {
      if (selected) {
        const data = await api.patch(`/admin/courses/${selected.id}`, courseForm);
        setSelected(data.course);
        toast.success(data.message || 'Module mis à jour.');
      } else {
        const data = await api.post('/admin/courses', courseForm);
        setSelected(data.course);
        toast.success(data.message || 'Module créé.');
      }
      await loadCourses();
      setShowCourseForm(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingCourse(false);
    }
  };

  const updateChapterField = (event) => setChapterForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const saveChapter = async (event) => {
    event.preventDefault();
    if (!selected) return;
    setSavingChapter(true);
    try {
      await api.post(`/admin/courses/${selected.id}/chapters`, chapterForm);
      setChapterForm(emptyChapter);
      setShowChapterForm(false);
      const data = await api.get(`/admin/courses/${selected.id}`);
      setCourseDetail(data);
      await loadCourses();
      toast.success('Chapitre ajouté au module.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingChapter(false);
    }
  };

  const removeChapter = async (chapterId) => {
    if (!window.confirm('Supprimer ce chapitre et ses données associées ?')) return;
    try {
      await api.delete(`/admin/chapters/${chapterId}`);
      const data = await api.get(`/admin/courses/${selected.id}`);
      setCourseDetail(data);
      await loadCourses();
      toast.info('Chapitre supprimé.');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const togglePublished = async (course) => {
    try {
      await api.patch(`/admin/courses/${course.id}`, { published: !course.published });
      await loadCourses();
      if (selected?.id === course.id) setSelected((current) => ({ ...current, published: !course.published }));
      toast.info(course.published ? 'Module masqué du catalogue.' : 'Module publié au catalogue.');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <PageLoader label="Chargement de l’espace administrateur" />;

  return (
    <div className="page-shell py-10 sm:py-14">
      <div className="flex flex-col justify-between gap-5 border-b border-line pb-8 sm:flex-row sm:items-end"><div><p className="eyebrow mb-3">Administration / contenu</p><h1 className="section-title">Publier. Organiser.<br />Faire progresser.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-muted">Gérez les modules Djangue, leurs chapitres et leur visibilité dans le catalogue.</p></div><Button onClick={() => { resetCourseForm(); setShowCourseForm(true); }}><Plus size={16} /> Nouveau module</Button></div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3"><div className="panel p-5"><p className="font-mono text-[9px] uppercase tracking-wider text-muted">Modules enregistrés</p><p className="mt-2 font-display text-3xl font-semibold text-white">{courses.length}</p></div><div className="panel p-5"><p className="font-mono text-[9px] uppercase tracking-wider text-muted">Publiés</p><p className="mt-2 font-display text-3xl font-semibold text-neon">{courses.filter((course) => course.published).length}</p></div><div className="panel p-5"><p className="font-mono text-[9px] uppercase tracking-wider text-muted">Brouillons</p><p className="mt-2 font-display text-3xl font-semibold text-electric">{courses.filter((course) => !course.published).length}</p></div></div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <section className="border border-line bg-surface"><div className="flex items-center justify-between border-b border-line px-5 py-4"><div><p className="eyebrow mb-1">Bibliothèque</p><h2 className="font-display text-xl font-semibold text-white">Tous les modules</h2></div><Layers3 size={18} className="text-electric" /></div><div className="divide-y divide-line/70">{courses.map((course) => <div key={course.id} className={`group flex items-center gap-3 px-5 py-4 transition ${selected?.id === course.id ? 'bg-neon/[0.045]' : 'hover:bg-raised'}`}><div className="grid h-9 w-9 shrink-0 place-items-center border border-line bg-[#0b1016]" style={{ color: course.accent }}><CourseIcon name={course.icon} size={17} /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-sm font-medium text-[#d9e1e4]">{course.title}</p>{!course.published && <StatusBadge tone="warning">Brouillon</StatusBadge>}</div><p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted">{course.technology} · {course.chapterCount} chapitres · {course.quizCount} quiz</p></div><button type="button" onClick={() => editCourse(course)} className="grid h-8 w-8 place-items-center text-muted opacity-0 transition hover:bg-raised hover:text-neon group-hover:opacity-100" aria-label={`Modifier ${course.title}`}><Edit3 size={14} /></button><button type="button" onClick={() => togglePublished(course)} className="grid h-8 w-8 place-items-center text-muted transition hover:bg-raised hover:text-white" aria-label={course.published ? 'Masquer le module' : 'Publier le module'}>{course.published ? <Eye size={14} /> : <EyeOff size={14} />}</button></div>)}</div></section>

        <div className="space-y-6">
          {showCourseForm ? <section className="border border-neon/30 bg-surface"><div className="flex items-center justify-between border-b border-line px-5 py-4"><div className="flex items-center gap-2"><Settings2 size={17} className="text-neon" /><h2 className="font-display text-xl font-semibold text-white">{selected ? 'Modifier le module' : 'Créer un module'}</h2></div><button type="button" onClick={resetCourseForm} className="text-muted hover:text-white" aria-label="Fermer"><X size={17} /></button></div><form onSubmit={saveCourse} className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6"><div className="sm:col-span-2"><label className="label-base" htmlFor="course-title">Titre</label><input id="course-title" name="title" value={courseForm.title} onChange={updateCourseField} className="input-base" required placeholder="JavaScript" /></div><div><label className="label-base" htmlFor="course-technology">Technologie</label><input id="course-technology" name="technology" value={courseForm.technology} onChange={updateCourseField} className="input-base" required placeholder="HTML" /></div><div><label className="label-base" htmlFor="course-level">Niveau</label><select id="course-level" name="level" value={courseForm.level} onChange={updateCourseField} className="input-base"><option>Débutant</option><option>Intermédiaire</option><option>Avancé</option></select></div><div className="sm:col-span-2"><label className="label-base" htmlFor="course-short">Description courte</label><input id="course-short" name="shortDescription" value={courseForm.shortDescription} onChange={updateCourseField} className="input-base" required maxLength={180} placeholder="Ce que l’apprenant va acquérir" /></div><div className="sm:col-span-2"><label className="label-base" htmlFor="course-description">Description complète</label><textarea id="course-description" name="description" value={courseForm.description} onChange={updateCourseField} className="input-base resize-none" rows="4" required placeholder="Décrivez le parcours et les objectifs du module." /></div><div><label className="label-base" htmlFor="course-duration">Durée en minutes</label><input id="course-duration" name="durationMinutes" type="number" min="0" value={courseForm.durationMinutes} onChange={updateCourseField} className="input-base" /></div><div><label className="label-base" htmlFor="course-icon">Icône</label><select id="course-icon" name="icon" value={courseForm.icon} onChange={updateCourseField} className="input-base"><option value="code-2">Code</option><option value="palette">Palette</option><option value="braces">Accolades</option><option value="coffee">Coffee</option><option value="file-code-2">Fichier</option><option value="terminal">Terminal</option><option value="network">Réseau</option><option value="workflow">Workflow</option><option value="git-branch">Git</option><option value="github">GitHub</option></select></div><div><label className="label-base" htmlFor="course-accent">Accent</label><div className="flex gap-2"><input id="course-accent" name="accent" value={courseForm.accent} onChange={updateCourseField} className="input-base font-mono uppercase" /><input type="color" value={courseForm.accent} onChange={updateCourseField} className="h-11 w-12 cursor-pointer border border-line bg-[#0c1118] p-1" aria-label="Sélecteur de couleur" /></div></div><label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted sm:col-span-2"><input type="checkbox" name="published" checked={courseForm.published} onChange={updateCourseField} className="h-3.5 w-3.5 accent-[#00ff9d]" /> Publier dans le catalogue</label><div className="flex justify-end gap-2 border-t border-line pt-4 sm:col-span-2"><Button type="button" variant="ghost" onClick={resetCourseForm}>Annuler</Button><Button type="submit" loading={savingCourse}><Save size={15} /> Enregistrer</Button></div></form></section> : <section className="border border-dashed border-line bg-surface p-8 text-center"><div className="mx-auto grid h-11 w-11 place-items-center border border-line bg-[#0b1016] text-electric"><BookPlus size={20} /></div><h2 className="mt-4 font-display text-lg font-semibold text-white">Sélectionnez un module</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">Choisissez un module dans la bibliothèque pour modifier ses informations ou ajouter un chapitre.</p></section>}

          {selected && <section className="border border-line bg-surface"><div className="flex flex-col justify-between gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center"><div><p className="eyebrow mb-1">Chapitres / {selected.technology}</p><h2 className="font-display text-xl font-semibold text-white">{selected.title}</h2></div><Button variant="secondary" size="sm" onClick={() => setShowChapterForm((value) => !value)}><FilePlus2 size={14} /> Ajouter un chapitre</Button></div>{showChapterForm && <form onSubmit={saveChapter} className="grid gap-4 border-b border-line bg-[#0c1117] p-5 sm:grid-cols-2"><div className="sm:col-span-2"><label className="label-base" htmlFor="chapter-title">Titre du chapitre</label><input id="chapter-title" name="title" value={chapterForm.title} onChange={updateChapterField} className="input-base" required /></div><div className="sm:col-span-2"><label className="label-base" htmlFor="chapter-summary">Résumé</label><input id="chapter-summary" name="summary" value={chapterForm.summary} onChange={updateChapterField} className="input-base" required /></div><div className="sm:col-span-2"><label className="label-base" htmlFor="chapter-content">Contenu Markdown</label><textarea id="chapter-content" name="content" value={chapterForm.content} onChange={updateChapterField} className="input-base min-h-28 resize-y font-mono text-xs" required placeholder="## Premier concept" /></div><div><label className="label-base" htmlFor="chapter-code">Code de démonstration</label><textarea id="chapter-code" name="code" value={chapterForm.code} onChange={updateChapterField} className="input-base min-h-24 resize-y font-mono text-xs" /></div><div><label className="label-base" htmlFor="chapter-language">Langage</label><select id="chapter-language" name="language" value={chapterForm.language} onChange={updateChapterField} className="input-base"><option value="text">Texte</option><option value="html">HTML</option><option value="css">CSS</option><option value="javascript">JavaScript</option><option value="java">Java</option><option value="php">PHP</option><option value="python">Python</option><option value="yaml">YAML</option><option value="bash">Bash</option></select></div><div className="flex items-end justify-between gap-3 sm:col-span-2"><div className="w-32"><label className="label-base" htmlFor="chapter-duration">Minutes</label><input id="chapter-duration" name="durationMinutes" type="number" min="0" value={chapterForm.durationMinutes} onChange={updateChapterField} className="input-base" /></div><div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => setShowChapterForm(false)}>Annuler</Button><Button type="submit" loading={savingChapter}><Save size={14} /> Ajouter</Button></div></div></form>}
            <div className="divide-y divide-line/70">{courseDetail?.chapters?.length ? courseDetail.chapters.map((chapter, index) => <div key={chapter.id} className="flex items-center gap-3 px-5 py-4"><span className="font-mono text-[10px] text-muted">{String(index + 1).padStart(2, '0')}</span><div className="min-w-0 flex-1"><p className="truncate text-sm text-[#d5dde1]">{chapter.title}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted">{chapter.language} · {chapter.durationMinutes} min</p></div><StatusBadge tone="success" icon="success">Publié</StatusBadge><button type="button" onClick={() => removeChapter(chapter.id)} className="grid h-8 w-8 place-items-center text-muted transition hover:bg-danger/5 hover:text-danger" aria-label={`Supprimer ${chapter.title}`}><Trash2 size={14} /></button></div>) : <div className="p-6 text-center text-sm text-muted">Aucun chapitre dans ce module.</div>}</div></section>}
        </div>
      </div>
    </div>
  );
}
