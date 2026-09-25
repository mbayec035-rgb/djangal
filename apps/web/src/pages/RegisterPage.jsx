import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, AtSign, CircleAlert, UserRound } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import { AuthField, PasswordField } from '../components/auth/AuthField.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [accept, setAccept] = useState(false);
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
    if (form.name.trim().length < 2) next.name = 'Indiquez un nom d’au moins 2 caractères.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Saisissez une adresse e-mail valide.';
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) next.password = '8 caractères minimum, avec une lettre et un chiffre.';
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Les mots de passe ne correspondent pas.';
    if (!accept) next.accept = 'Vous devez accepter les règles d’utilisation.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setFormError('');
    try {
      const newUser = await register({ name: form.name, email: form.email, password: form.password });
      toast.success(`Compte créé. Bienvenue, ${newUser.name.split(' ')[0]}.`);
      navigate('/tableau-de-bord', { replace: true });
    } catch (error) {
      setFormError(error.message);
      if (error.data?.field) setErrors({ [error.data.field]: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-3">Initialisation / 02</p>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-white">Créer votre accès<span className="text-electric">.</span></h1>
        <p className="mt-3 text-sm leading-6 text-muted">Un compte étudiant suffit pour commencer. Les accès administrateur sont fournis séparément.</p>
      </div>

      {formError && (
        <div className="mb-5 flex gap-3 border border-danger/40 bg-danger/5 p-3.5 text-sm text-[#f2a7b8]" role="alert">
          <CircleAlert size={17} className="mt-0.5 shrink-0 text-danger" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthField label="Nom complet" name="name" value={form.name} onChange={update} error={errors.name} placeholder="Camille Diallo" autoComplete="name" icon={UserRound} />
        <AuthField label="Adresse e-mail" name="email" type="email" value={form.email} onChange={update} error={errors.email} placeholder="vous@exemple.com" autoComplete="email" icon={AtSign} />
        <PasswordField label="Mot de passe" name="password" value={form.password} onChange={update} error={errors.password} placeholder="8 caractères minimum" autoComplete="new-password" hint="Une lettre, un chiffre et au moins 8 caractères." />
        <PasswordField label="Confirmer le mot de passe" name="confirmPassword" value={form.confirmPassword} onChange={update} error={errors.confirmPassword} placeholder="Répétez le mot de passe" autoComplete="new-password" />
        <div>
          <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-muted">
            <input type="checkbox" checked={accept} onChange={(event) => { setAccept(event.target.checked); setErrors((current) => ({ ...current, accept: '' })); }} className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#00ff9d]" />
            <span>J’accepte les règles d’utilisation et la conservation de ma progression dans mon compte.</span>
          </label>
          {errors.accept && <p className="mt-1.5 font-mono text-[10px] text-danger">{errors.accept}</p>}
        </div>
        <Button type="submit" loading={submitting} className="mt-2 w-full">
          Initialiser mon compte <ArrowRight size={16} />
        </Button>
      </form>

      <div className="mt-8 flex items-center justify-center gap-2 border-t border-line pt-6 text-xs text-muted">
        <span>Déjà enregistré ?</span>
        <Link to="/connexion" className="font-mono font-semibold text-neon hover:text-white">Ouvrir une session</Link>
      </div>
    </div>
  );
}
