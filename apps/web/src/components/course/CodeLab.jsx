import { useMemo, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { Check, Clipboard, Code2, Play, RotateCcw, Terminal, TriangleAlert } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { cn } from '../../lib/utils.js';

loader.config({ monaco });

const languageMap = {
  html: 'html',
  css: 'css',
  javascript: 'javascript',
  js: 'javascript',
  java: 'java',
  php: 'php',
  python: 'python',
  text: 'plaintext',
  yaml: 'yaml',
  bash: 'shell',
};

function buildPreview(chapter, code) {
  if (chapter.language === 'html') return code;
  if (chapter.language === 'css') return `<style>${code}</style><main class="preview-target">${chapter.title}</main>`;
  return '';
}

function executeJavaScript(source) {
  return new Promise((resolve) => {
    const workerSource = `
      const format = (value) => {
        if (typeof value === 'string') return value;
        try { return JSON.stringify(value); } catch (error) { return String(value); }
      };
      self.onmessage = (event) => {
        const logs = [];
        const originalConsole = self.console;
        self.console = {
          log: (...values) => logs.push(values.map(format).join(' ')),
          info: (...values) => logs.push(values.map(format).join(' ')),
          warn: (...values) => logs.push('Avertissement · ' + values.map(format).join(' ')),
          error: (...values) => logs.push('Erreur · ' + values.map(format).join(' ')),
        };
        try {
          const result = (0, eval)(event.data);
          if (result !== undefined) logs.push('→ ' + format(result));
          self.postMessage({ logs, error: null });
        } catch (error) {
          self.postMessage({ logs, error: String(error && error.message ? error.message : error) });
        } finally {
          self.console = originalConsole;
        }
      };
    `;
    const url = URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }));
    const worker = new Worker(url);
    const timeout = window.setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ logs: [], error: 'Temps d’exécution dépassé.' });
    }, 3000);

    worker.onmessage = (event) => {
      window.clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(event.data);
    };
    worker.onerror = () => {
      window.clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ logs: [], error: 'Le moteur JavaScript a rencontré une erreur.' });
    };
    worker.postMessage(source);
  });
}

export default function CodeLab({ chapter }) {
  const toast = useToast();
  const { isDark } = useTheme();
  const [code, setCode] = useState(chapter.code || '');
  const [activeTab, setActiveTab] = useState('code');
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [execution, setExecution] = useState({ logs: [], error: null });
  const preview = useMemo(() => buildPreview(chapter, code), [chapter, code]);
  const isJavaScript = ['javascript', 'js'].includes(chapter.language);
  const isBrowserPreview = ['html', 'css'].includes(chapter.language);
  const canExecute = isJavaScript || isBrowserPreview;

  const reset = () => {
    setCode(chapter.code || '');
    setActiveTab('code');
    setExecution({ logs: [], error: null });
    toast.info('Laboratoire réinitialisé.');
  };

  const run = async () => {
    if (!canExecute) {
      toast.info('L’exécution navigateur est disponible pour HTML, CSS et JavaScript. Les autres langages restent en édition dans ce laboratoire web.');
      return;
    }
    setRunning(true);
    if (isJavaScript) {
      setActiveTab('console');
      const result = await executeJavaScript(code);
      setExecution(result);
    } else {
      setActiveTab('preview');
      setExecution({ logs: ['Aperçu HTML/CSS rendu dans le panneau de prévisualisation.'], error: null });
      window.setTimeout(() => setRunning(false), 420);
      return;
    }
    setRunning(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error('Le presse-papiers n’est pas disponible dans ce navigateur.');
    }
  };

  return (
    <section className="border border-line bg-[#090d13]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-[#c8d0d5]"><Code2 size={15} className="text-neon" /> Laboratoire</div>
          <span className="hidden border-l border-line pl-3 font-mono text-[10px] uppercase tracking-wider text-muted sm:inline">{chapter.language}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={reset} className="grid h-8 w-8 place-items-center text-muted transition hover:bg-raised hover:text-white" aria-label="Réinitialiser le code" title="Réinitialiser"><RotateCcw size={14} /></button>
          <button type="button" onClick={copy} className="grid h-8 w-8 place-items-center text-muted transition hover:bg-raised hover:text-white" aria-label="Copier le code" title="Copier le code">{copied ? <Check size={14} className="text-neon" /> : <Clipboard size={14} />}</button>
          <button type="button" onClick={run} className="inline-flex h-8 items-center gap-1.5 border border-neon/50 px-2.5 font-mono text-[9px] uppercase tracking-wider text-neon transition hover:bg-neon/10"><Play size={12} />{running ? 'Exécution...' : 'Exécuter'}</button>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-line bg-[#0c1118]">
        <button type="button" onClick={() => setActiveTab('code')} className={cn('whitespace-nowrap border-b-2 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] transition', activeTab === 'code' ? 'border-neon text-neon' : 'border-transparent text-muted hover:text-white')}>Éditeur</button>
        {isBrowserPreview && <button type="button" onClick={() => setActiveTab('preview')} className={cn('whitespace-nowrap border-b-2 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] transition', activeTab === 'preview' ? 'border-electric text-electric' : 'border-transparent text-muted hover:text-white')}>Aperçu</button>}
        {isJavaScript && <button type="button" onClick={() => setActiveTab('console')} className={cn('whitespace-nowrap border-b-2 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] transition', activeTab === 'console' ? 'border-electric text-electric' : 'border-transparent text-muted hover:text-white')}>Console</button>}
        {!canExecute && <span className="flex items-center gap-2 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.1em] text-muted"><Terminal size={12} /> Édition seule</span>}
      </div>

      {activeTab === 'code' ? (
        <div className="monaco-shell h-[300px] sm:h-[360px]">
          <Editor
            height="100%"
            language={languageMap[chapter.language] || 'plaintext'}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme={isDark ? 'vs-dark' : 'vs'}
            options={{
              minimap: { enabled: false },
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              lineHeight: 21,
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              renderLineHighlight: 'line',
              overviewRulerBorder: false,
              overviewRulerLanes: 0,
              tabSize: 2,
              wordWrap: 'on',
            }}
          />
        </div>
      ) : activeTab === 'console' ? (
        <div className="h-[300px] sm:h-[360px] overflow-auto bg-[#070a0e] p-4 font-mono text-xs">
          {execution.logs.length === 0 && !execution.error && <p className="text-muted">Aucune sortie. Utilisez console.log() pour afficher un résultat.</p>}
          {execution.logs.map((line, index) => <p key={`${line}-${index}`} className="mb-2 whitespace-pre-wrap text-[#a9e9c9]"><span className="mr-2 text-neon">›</span>{line}</p>)}
          {execution.error && <p className="mt-3 flex items-start gap-2 whitespace-pre-wrap text-danger"><TriangleAlert size={14} className="mt-0.5 shrink-0" />{execution.error}</p>}
          <p className="mt-6 border-t border-line pt-3 text-[10px] uppercase tracking-[0.1em] text-[#5f6d77]">Exécution isolée dans un Web Worker · délai maximal 3 secondes</p>
        </div>
      ) : (
        <div className="h-[300px] sm:h-[360px] bg-[#070a0e] p-4">
          {isBrowserPreview ? <iframe title="Aperçu du laboratoire" srcDoc={preview} sandbox="allow-scripts" className="h-full w-full border border-line bg-[#ffffff]" /> : <div className="flex h-full flex-col items-center justify-center border border-dashed border-line text-center"><Terminal size={26} className="text-electric" /><p className="mt-4 font-mono text-xs uppercase tracking-wider text-[#c5ced3]">Aperçu non disponible</p></div>}
        </div>
      )}
    </section>
  );
}
