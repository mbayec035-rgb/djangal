import { useEffect, useRef, useState } from 'react';
import { Camera, Check, FileImage, KeyRound, LogOut, Save, ShieldCheck, UserRound } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { formatDate, formatRelativeDate, initials } from '../lib/utils.js';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const fileInput = useRef(null);
  const [profile, setProfile] = useState({ name: user?.name || '', bio: user?.bio || '', avatar: user?.avatar || null });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  useEffect(() => {
    api.get('/quizzes/attempts').then((data) => setAttempts(data.attempts || [])).catch(() => {}).finally(() => setLoadingAttempts(false));
  }, []);

  const updateProfileField = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setProfileErrors((current) => ({ ...current, [name]: '' }));
  };

  const uploadAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 450 * 1024) {
      toast.error('Choisissez une image de moins de 450 Ko.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProfile((current) => ({ ...current, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    const errors = {};
    if (profile.name.trim().length < 2) errors.name = 'Le nom doit contenir au moins 2 caractères.';
    if (profile.bio.length > 240) errors.bio = 'La bio ne peut pas dépasser 240 caractères.';
    setProfileErrors(errors);
    if (Object.keys(errors).length) return;
    setSavingProfile(true);
    try {
      const data = await api.patch('/users/profile', profile);
      updateUser(data.user);
      toast.success(data.message || 'Profil mis à jour.');
    } catch (error) {
      if (error.data?.field) setProfileErrors({ [error.data.field]: error.message });
      else toast.error(error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!password.currentPassword) errors.currentPassword = 'Saisissez votre mot de passe actuel.';
    if (password.newPassword.length < 8 || !/[A-Za-z]/.test(password.newPassword) || !/\d/.test(password.newPassword)) errors.newPassword = '8 caractères minimum, avec une lettre et un chiffre.';
    if (password.newPassword !== password.confirmPassword) errors.confirmPassword = 'La confirmation ne correspond pas.';
    setPasswordErrors(errors);
    if (Object.keys(errors).length) return;
    setSavingPassword(true);
    try {
      const data = await api.patch('/users/password', { currentPassword: password.currentPassword, newPassword: password.newPassword });
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success(data.message || 'Mot de passe mis à jour.');
    } catch (error) {
      if (error.data?.field) setPasswordErrors({ [error.data.field]: error.message });
      else toast.error(error.message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="page-shell py-10 sm:py-14">
      <div className="mb-10 flex flex-col justify-between gap-5 border-b border-line pb-8 sm:flex-row sm:items-end"><div><p className="eyebrow mb-3">Compte / identité</p><h1 className="section-title">Votre profil.</h1><p className="mt-3 text-sm text-muted">Gérez votre identité, votre sécurité et votre historique d’apprentissage.</p></div><Button variant="danger" onClick={logout}><LogOut size={15} /> Déconnexion</Button></div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <div className="space-y-6">
          <section className="border border-line bg-surface">
            <div className="flex items-center gap-3 border-b border-line px-5 py-4"><div className="grid h-9 w-9 place-items-center border border-neon/30 bg-neon/5 text-neon"><UserRound size={17} /></div><div><h2 className="font-display text-lg font-semibold text-white">Informations personnelles</h2><p className="text-xs text-muted">Votre nom et votre bio sont visibles sur votre tableau de bord.</p></div></div>
            <form onSubmit={saveProfile} className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-center"><button type="button" onClick={() => fileInput.current?.click()} className="group relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden border border-neon/40 bg-neon/5 text-neon"><span className="font-mono text-2xl font-semibold">{initials(profile.name || user.name)}</span>{profile.avatar && <img src={profile.avatar} alt="Avatar" className="absolute inset-0 h-full w-full object-cover" />}<span className="absolute inset-0 grid place-items-center bg-[#06100c]/70 opacity-0 transition group-hover:opacity-100"><Camera size={18} /></span></button><div><input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadAvatar} className="hidden" /><Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}><FileImage size={14} /> Changer l’avatar</Button><p className="mt-2 max-w-xs text-[10px] leading-4 text-muted">PNG, JPEG ou WebP · 450 Ko maximum.</p></div></div>
              <div><label className="label-base" htmlFor="profile-name">Nom complet</label><input id="profile-name" name="name" value={profile.name} onChange={updateProfileField} className="input-base" /><p className="mt-1.5 font-mono text-[10px] text-muted">2 à 80 caractères.</p></div>
              <div><div className="flex items-center justify-between"><label className="label-base mb-2" htmlFor="profile-bio">Bio</label><span className="font-mono text-[9px] text-muted">{profile.bio.length}/240</span></div><textarea id="profile-bio" name="bio" value={profile.bio} onChange={updateProfileField} rows="4" className="input-base resize-none" placeholder="Ce que vous apprenez actuellement..." /></div>
              <div className="border-t border-line pt-5"><Button type="submit" loading={savingProfile}><Save size={15} /> Enregistrer les modifications</Button></div>
            </form>
          </section>

          <section id="securite" className="border border-line bg-surface">
            <div className="flex items-center gap-3 border-b border-line px-5 py-4"><div className="grid h-9 w-9 place-items-center border border-electric/30 bg-electric/5 text-electric"><KeyRound size={17} /></div><div><h2 className="font-display text-lg font-semibold text-white">Sécurité du compte</h2><p className="text-xs text-muted">Mettez à jour votre mot de passe d’accès.</p></div></div>
            <form onSubmit={savePassword} className="space-y-4 p-5 sm:p-6"><div><label className="label-base" htmlFor="current-password">Mot de passe actuel</label><input id="current-password" type="password" value={password.currentPassword} onChange={(event) => setPassword((current) => ({ ...current, currentPassword: event.target.value }))} className="input-base" autoComplete="current-password" />{passwordErrors.currentPassword && <p className="mt-1.5 font-mono text-[10px] text-danger">{passwordErrors.currentPassword}</p>}</div><div><label className="label-base" htmlFor="new-password">Nouveau mot de passe</label><input id="new-password" type="password" value={password.newPassword} onChange={(event) => setPassword((current) => ({ ...current, newPassword: event.target.value }))} className="input-base" autoComplete="new-password" />{passwordErrors.newPassword && <p className="mt-1.5 font-mono text-[10px] text-danger">{passwordErrors.newPassword}</p>}</div><div><label className="label-base" htmlFor="confirm-password">Confirmation</label><input id="confirm-password" type="password" value={password.confirmPassword} onChange={(event) => setPassword((current) => ({ ...current, confirmPassword: event.target.value }))} className="input-base" autoComplete="new-password" />{passwordErrors.confirmPassword && <p className="mt-1.5 font-mono text-[10px] text-danger">{passwordErrors.confirmPassword}</p>}</div><Button type="submit" loading={savingPassword}><KeyRound size={15} /> Modifier le mot de passe</Button></form>
          </section>
        </div>

        <div className="space-y-6">
          <section className="border border-line bg-surface p-5 sm:p-6"><div className="flex items-center gap-4">{profile.avatar ? <img src={profile.avatar} alt="" className="h-16 w-16 border border-neon/40 object-cover" /> : <div className="grid h-16 w-16 place-items-center border border-neon/40 bg-neon/5 font-mono text-xl font-semibold text-neon">{initials(profile.name || user.name)}</div>}<div><p className="font-display text-xl font-semibold text-white">{profile.name || user.name}</p><p className="mt-1 font-mono text-[10px] text-muted">{user.email}</p><div className="mt-2"><StatusBadge tone={user.role === 'admin' ? 'info' : 'success'} icon={user.role === 'admin' ? 'info' : 'success'}>{user.role === 'admin' ? 'Administrateur' : 'Étudiant'}</StatusBadge></div></div></div><div className="mt-6 grid grid-cols-2 border border-line bg-[#0b1016]"><div className="border-r border-line p-3"><p className="font-display text-xl font-semibold text-white">{attempts.length}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted">Tentatives</p></div><div className="p-3"><p className="font-display text-xl font-semibold text-neon">{attempts.filter((attempt) => attempt.passed).length}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted">Réussies</p></div></div><p className="mt-4 flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-muted"><ShieldCheck size={12} className="text-neon" /> Membre depuis le {formatDate(user.createdAt)}</p></section>

          <section className="border border-line bg-surface"><div className="border-b border-line px-5 py-4"><p className="eyebrow mb-1">Journal</p><h2 className="font-display text-xl font-semibold text-white">Historique des quiz</h2></div>{loadingAttempts ? <div className="p-6 font-mono text-xs text-muted">Chargement...</div> : attempts.length ? <div className="divide-y divide-line/70">{attempts.map((attempt) => <div key={attempt.id} className="flex items-center gap-3 px-5 py-4"><div className={`grid h-9 w-9 shrink-0 place-items-center border ${attempt.passed ? 'border-neon/30 bg-neon/5 text-neon' : 'border-danger/30 bg-danger/5 text-danger'}`}><span className="font-mono text-[10px] font-semibold">{attempt.score}%</span></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-[#d1d9dd]">{attempt.title}</p><p className="mt-1 truncate font-mono text-[9px] uppercase tracking-wider text-muted">{attempt.courseTitle} · {formatRelativeDate(attempt.createdAt)}</p></div>{attempt.passed ? <Check size={15} className="text-neon" /> : <span className="font-mono text-[9px] text-danger">À revoir</span>}</div>)}</div> : <div className="p-6 text-center"><p className="text-sm text-muted">Aucun quiz passé pour l’instant.</p></div>}</section>
        </div>
      </div>
    </div>
  );
}
