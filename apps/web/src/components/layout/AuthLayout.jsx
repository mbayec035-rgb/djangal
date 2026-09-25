import { Outlet } from 'react-router-dom';
import { Braces, CheckCircle2, Database, ShieldCheck } from 'lucide-react';
import Logo from '../ui/Logo.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import Typewriter from '../effects/Typewriter.jsx';

const terminalLines = [
  { time: '08:42:16', command: 'djangue init --secure', output: 'Environnement initialisé' },
  { time: '08:42:17', command: 'auth policy --role student', output: 'Jetons JWT actifs' },
  { time: '08:42:18', command: 'progress sync --module all', output: 'Progression disponible' },
];

export default function AuthLayout() {
  return (
    <main className="grid min-h-screen bg-void lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden border-r border-line bg-[#090d12] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="absolute inset-0 cyber-grid opacity-80" />
        <div className="absolute left-[28%] top-[18%] h-72 w-72 rounded-full bg-neon/[0.035] blur-3xl" />
        <div className="absolute bottom-[8%] right-[10%] h-52 w-52 rounded-full bg-electric/[0.035] blur-3xl" />

        <div className="relative">
          <Logo />
        </div>

        <div className="relative my-14 max-w-xl">
          <p className="eyebrow mb-5">Terminal d’apprentissage</p>
          <h1 className="font-display text-5xl font-semibold leading-[1.06] tracking-[-0.05em] text-white xl:text-6xl">
            Développez vos compétences.<br />
            <Typewriter words={['Exécutez votre progression.', 'Maîtrisez les outils.', 'Validez vos acquis.']} className="text-neon" />
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted">Des parcours structurés, des exercices guidés et une progression mesurable pour chaque compétence technique.</p>
        </div>

        <div className="relative border border-line bg-[#090d12] shadow-2xl">
          <div className="flex h-10 items-center justify-between border-b border-line px-4">
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.13em] text-[#71808a]">
              <span className="h-2 w-2 rounded-full bg-neon" />
              djangue-shell
            </div>
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-1.5 w-1.5 bg-[#33414c]" />
              <span className="h-1.5 w-1.5 bg-[#33414c]" />
              <span className="h-1.5 w-1.5 bg-[#33414c]" />
            </div>
          </div>
          <div className="space-y-3 p-5 font-mono text-[11px] sm:p-6">
            {terminalLines.map((line) => (
              <div key={line.time} className="grid grid-cols-[64px_1fr] gap-3 sm:grid-cols-[74px_1fr]">
                <span className="text-[#4d5b65]">{line.time}</span>
                <div>
                  <p><span className="mr-2 text-neon">$</span><span className="text-[#dbe2e6]">{line.command}</span></p>
                  <p className="mt-0.5 pl-4 text-[#71808a]">{line.output}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-line px-5 py-3 font-mono text-[9px] uppercase tracking-[0.1em] text-[#64717b]">
            <span className="flex items-center gap-2"><Database size={12} /> Données persistantes</span>
            <span className="flex items-center gap-2"><ShieldCheck size={12} /> Session sécurisée</span>
          </div>
        </div>
      </section>

      <section className="relative flex min-h-screen flex-col bg-[#0d1219]">
        <div className="absolute inset-0 dot-grid opacity-[0.16]" />
        <div className="relative flex items-center justify-between border-b border-line px-5 py-5 lg:justify-end lg:px-10">
          <div className="lg:hidden"><Logo /></div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted sm:flex">
              <Braces size={13} className="text-electric" /> Environnement sécurisé
            </div>
            <ThemeToggle />
          </div>
        </div>
        <div className="relative flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <Outlet />
            <div className="mt-8 flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[#5e6b75]">
              <CheckCircle2 size={12} className="text-neon" /> Connexion chiffrée côté serveur
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
