import { Link } from 'react-router-dom';
import { Github, Radio, ShieldCheck } from 'lucide-react';
import Logo from '../ui/Logo.jsx';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-[#080b10]">
      <div className="page-shell grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">Une plateforme d’apprentissage structurée pour développer des compétences techniques solides et vérifiables.</p>
          <div className="mt-5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#71808a]">
            <span className="h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_7px_rgba(0,255,157,.8)]" />
            Système opérationnel
          </div>
        </div>
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#cbd3d8]">Navigation</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-muted">
            <Link to="/catalogue" className="transition hover:text-neon">Catalogue</Link>
            <Link to="/tableau-de-bord" className="transition hover:text-neon">Tableau de bord</Link>
            <Link to="/profil" className="transition hover:text-neon">Mon profil</Link>
            <Link to="/admin" className="transition hover:text-neon">Administration</Link>
          </div>
        </div>
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#cbd3d8]">Environnement</p>
          <div className="mt-4 space-y-3 text-sm text-muted">
            <p className="flex items-center gap-2"><ShieldCheck size={15} className="text-electric" /> Aucun compte requis</p>
            <p className="flex items-center gap-2"><Radio size={15} className="text-neon" /> Progression persistante</p>
            <p className="flex items-center gap-2"><Github size={15} className="text-[#a3afb7]" /> Projet React et Node.js</p>
          </div>
        </div>
      </div>
      <div className="border-t border-line/70">
        <div className="page-shell flex flex-col gap-2 py-5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#64717b] sm:flex-row sm:items-center sm:justify-between">
          <p>Djangue Learning System · Version 1.0</p>
          <p>Conçu pour l’apprentissage continu</p>
        </div>
      </div>
    </footer>
  );
}
