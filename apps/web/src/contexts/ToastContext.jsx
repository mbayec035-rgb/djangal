import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((items) => [...items, { id, message, type }].slice(-4));
    window.setTimeout(() => dismiss(id), 4200);
    return id;
  }, [dismiss]);

  const value = useMemo(() => ({ push, dismiss, success: (message) => push(message, 'success'), error: (message) => push(message, 'error'), info: (message) => push(message, 'info') }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const Icon = toast.type === 'error' ? CircleAlert : toast.type === 'info' ? Info : CheckCircle2;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 24, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 16, scale: 0.98 }}
                className={`pointer-events-auto flex items-start gap-3 border bg-raised p-4 shadow-2xl ${toast.type === 'error' ? 'border-danger/50' : toast.type === 'info' ? 'border-electric/40' : 'border-neon/40'}`}
              >
                <Icon size={18} className={toast.type === 'error' ? 'mt-0.5 text-danger' : toast.type === 'info' ? 'mt-0.5 text-electric' : 'mt-0.5 text-neon'} />
                <p className="flex-1 text-sm leading-5 text-[#d5dce0]">{toast.message}</p>
                <button type="button" onClick={() => dismiss(toast.id)} className="text-muted transition hover:text-white" aria-label="Fermer la notification">
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast doit être utilisé dans ToastProvider.');
  return context;
}
