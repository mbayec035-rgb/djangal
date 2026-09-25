import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Gauge, Menu, UserRound, X } from 'lucide-react';
import Logo from '../ui/Logo.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { cn, initials } from '../../lib/utils.js';

const navigation = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/catalogue', label: 'Catalogue' },
  { to: '/tableau-de-bord', label: 'Tableau de bord' },
  { to: '/admin', label: 'Administration' },
];

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-line/90 bg-[#0a0e14]">
      <div className="page-shell flex h-[70px] items-center justify-between gap-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                'relative px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.1em] transition',
                isActive ? 'text-neon' : 'text-[#89969f] hover:text-white',
              )}
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && <span className="absolute inset-x-4 -bottom-[19px] h-px bg-neon shadow-[0_0_8px_rgba(0,255,157,.8)]" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle className="h-9 w-9" />
          {user && (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                className="flex items-center gap-2.5 border border-line bg-surface py-1.5 pl-1.5 pr-3 transition hover:border-neon/50"
                aria-expanded={accountOpen}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-7 w-7 object-cover" />
                ) : (
                  <span className="grid h-7 w-7 place-items-center bg-neon/10 font-mono text-[10px] font-semibold text-neon">{initials(user.name)}</span>
                )}
                <span className="max-w-28 truncate text-xs font-medium text-[#d9e0e4]">{user.name}</span>
                <ChevronDown size={13} className={cn('text-muted transition', accountOpen && 'rotate-180')} />
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-60 border border-line bg-raised p-2 shadow-2xl">
                  <div className="border-b border-line px-3 py-3">
                    <p className="truncate text-sm font-medium text-white">{user.name}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">Profil local · enregistré dans ce navigateur</p>
                  </div>
                  <Link to="/tableau-de-bord" className="mt-1 flex items-center gap-2.5 px-3 py-2.5 text-xs text-[#b6c0c6] transition hover:bg-[#1a232c] hover:text-white">
                    <Gauge size={15} /> Tableau de bord
                  </Link>
                  <Link to="/profil" className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-[#b6c0c6] transition hover:bg-[#1a232c] hover:text-white">
                    <UserRound size={15} /> Mon profil
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle className="h-10 w-10" />
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center border border-line bg-surface text-white lg:hidden"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-[#0b1016] lg:hidden">
          <div className="page-shell py-4">
            <nav className="flex flex-col" aria-label="Navigation mobile">
              {navigation.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('border-b border-line/70 py-3.5 font-mono text-xs uppercase tracking-[0.1em]', isActive ? 'text-neon' : 'text-[#a2adb4]')}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
