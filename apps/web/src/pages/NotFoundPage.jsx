import { Link } from 'react-router-dom';
import { ArrowLeft, Terminal } from 'lucide-react';
import { buttonStyles } from '../components/ui/Button.jsx';

export default function NotFoundPage() {
  return <div className="page-shell grid min-h-[60vh] place-items-center py-20"><div className="text-center"><div className="mx-auto grid h-16 w-16 place-items-center border border-neon/40 bg-neon/5 text-neon shadow-neon-sm"><Terminal size={28} /></div><p className="eyebrow mt-7">Erreur 404 / route inconnue</p><h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.06em] text-white">Signal perdu.</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted">Cette page n’existe pas dans le protocole Djangue. Retournez à un point connu.</p><Link to="/" className={buttonStyles({ className: 'mt-7' })}><ArrowLeft size={15} /> Revenir à l’accueil</Link></div></div>;
}
