import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils.js';

export function AuthField({ label, name, type = 'text', value, onChange, error, placeholder, autoComplete, icon: Icon, required = true }) {
  return (
    <div>
      <label className="label-base" htmlFor={name}>{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#63717b]" />}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={cn('input-base', Icon && 'pl-10', error && 'border-danger focus:border-danger focus:shadow-none')}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      </div>
      {error && <p id={`${name}-error`} className="mt-1.5 font-mono text-[10px] text-danger">{error}</p>}
    </div>
  );
}

export function PasswordField({ label = 'Mot de passe', name = 'password', value, onChange, error, placeholder = 'Votre mot de passe', autoComplete = 'current-password', hint }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="label-base" htmlFor={name}>{label}</label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className={cn('input-base pr-11', error && 'border-danger focus:border-danger focus:shadow-none')}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        />
        <button type="button" onClick={() => setVisible((current) => !current)} className="absolute right-0 top-0 grid h-full w-11 place-items-center text-[#63717b] transition hover:text-neon" aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error ? <p id={`${name}-error`} className="mt-1.5 font-mono text-[10px] text-danger">{error}</p> : hint && <p id={`${name}-hint`} className="mt-1.5 font-mono text-[10px] leading-4 text-muted">{hint}</p>}
    </div>
  );
}
