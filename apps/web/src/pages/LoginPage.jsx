import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, AtSign, CircleAlert, KeyRound, ShieldCheck, Terminal } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import { AuthField, PasswordField } from '../components/auth/AuthField.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { cn } from '../lib/utils.js';

const demoAccounts = [
  { label: 'Étudiant', email: 'student@djangue.dev', password: 'DjangueStudent2026!' },
  { label: 'Admin', email: 'admin@djangue.dev', password: 'DjangueAdmin2026!' },
];

export default function LoginPage() {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate('/tableau-de-bord', { replace: true });
  }, [user, navigate]);

  if (user) return <Navigate to="/tableau-de-bord" replace />;

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setFormError('');
  };

  const validate = () => {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Saisissez une adresse e-mail valide.';
    if (!form.password) next.password = 'Le mot de passe est obligatoire.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setFormError('');
    try {
      const loggedUser = await login(form);
      toast.success(`Session ouverte. Bienvenue, ${loggedUser.name.split(' ')[0]}.`);
      navigate(location.state?.from?.pathname || '/tableau-de-bord', { replace: true });
    } catch (error) {
      setFormError(error.message);
      if (error.data?.field) setErrors({ [error.data.field]: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (account) => {
    setForm({ email: account.email, password: account.password });
    setErrors({});
    setFormError('');
  };

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-3">Accès sécurisé / 01</p>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-white">Ravi de vous revoir<span className="text-neon">.</span></h1>
        <p className="mt-3 text-sm leading-6 text-muted">Connectez-vous pour reprendre votre parcours et suivre vos évaluations.</p>
      </div>

      {formError && (
        <div className="mb-5 flex gap-3 border border-danger/40 bg-danger/5 p-3.5 text-sm text-[#f2a7b8]" role="alert">
          <CircleAlert size={17} className="mt-0.5 shrink-0 text-danger" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthField label="Adresse e-mail" name="email" type="email" value={form.email} onChange={update} error={errors.email} placeholder="vous@exemple.com" autoComplete="email" icon={AtSign} />
        <PasswordField value={form.password} onChange={update} error={errors.password} placeholder="Votre mot de passe" autoComplete="current-password" />
        <div className="flex items-center justify-between gap-4 pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
            <input type="checkbox" className="h-3.5 w-3.5 accent-[#00ff9d]" />
            Se souvenir de moi
          </label>
          <span className="font-mono text-[10px] text-[#60707a]">Mot de passe oublié ?</span>
        </div>
        <Button type="submit" loading={submitting} className="mt-2 w-full">
          Ouvrir ma session <ArrowRight size={16} />
        </Button>
      </form>

      <div className="my-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5f6c75]">Accès de démonstration</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {demoAccounts.map((account) => (
          <button key={account.email} type="button" onClick={() => fillDemo(account)} className="group border border-line bg-[#0b1016] p-3 text-left transition hover:border-neon/50 hover:bg-neon/[0.03]">
            <span className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#d4dce0]"><Terminal size={13} className="text-neon" />{account.label}</span>
            <span className="mt-1.5 block truncate text-[10px] text-muted">{account.email}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 border-t border-line pt-6 text-xs text-muted">
        <ShieldCheck size={14} className="text-neon" />
        <span>Pas encore de compte ?</span>
        <Link to="/inscription" className="font-mono font-semibold text-neon hover:text-white">Créer un profil</Link>
      </div>
    </div>
  );
}
