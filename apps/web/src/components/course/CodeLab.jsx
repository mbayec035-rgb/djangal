import { useMemo, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { Check, Clipboard, Code2, Play, RotateCcw, Terminal } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext.jsx';
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

function buildPreview(chapter) {
  if (chapter.language === 'html' || chapter.language === 'css' || chapter.language === 'javascript' || chapter.language === 'js') {
    const code = chapter.code || '';
    if (chapter.language === 'html') return code;
    if (chapter.language === 'css') return `<style>${code}</style><main class="preview-target">${chapter.title}</main>`;
    return `<main id="preview-target" class="preview-target">${chapter.title}</main><script>${code}</script>`;
  }
  return '';
}

export default function CodeLab({ chapter }) {
  const toast = useToast();
  const [code, setCode] = useState(chapter.code || '');
  const [activeTab, setActiveTab] = useState('code');
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const preview = useMemo(() => buildPreview({ ...chapter, code }), [chapter, code]);
  const isPreviewable = ['html', 'css', 'javascript', 'js'].includes(chapter.language);

  const reset = () => {
    setCode(chapter.code || '');
    setActiveTab('code');
    toast.info('Laboratoire réinitialisé.');
  };

  const run = () => {
    if (!isPreviewable) {
      toast.info('Aperçu local disponible pour HTML, CSS et JavaScript. Les autres langages sont éditables dans le laboratoire.');
      return;
    }
    setRunning(true);
    setActiveTab('preview');
    window.setTimeout(() => setRunning(false), 420);
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
          {isPreviewable && <button type="button" onClick={run} className="inline-flex h-8 items-center gap-1.5 border border-neon/50 px-2.5 font-mono text-[9px] uppercase tracking-wider text-neon transition hover:bg-neon/10"><Play size={12} />{running ? 'Exécution...' : 'Exécuter'}</button>}
        </div>
      </div>

      <div className="flex border-b border-line bg-[#0c1118]">
        <button type="button" onClick={() => setActiveTab('code')} className={cn('border-b-2 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] transition', activeTab === 'code' ? 'border-neon text-neon' : 'border-transparent text-muted hover:text-white')}>Éditeur</button>
        <button type="button" onClick={() => setActiveTab('preview')} className={cn('border-b-2 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] transition', activeTab === 'preview' ? 'border-electric text-electric' : 'border-transparent text-muted hover:text-white')}>Aperçu</button>
      </div>

      {activeTab === 'code' ? (
        <div className="monaco-shell h-[360px]">
          <Editor
            height="100%"
            language={languageMap[chapter.language] || 'plaintext'}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
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
      ) : (
        <div className="h-[360px] bg-[#070a0e] p-4">
          {isPreviewable ? (
            <iframe title="Aperçu du laboratoire" srcDoc={preview} sandbox="allow-scripts" className="h-full w-full border border-line bg-white" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center border border-dashed border-line text-center">
              <Terminal size={26} className="text-electric" />
              <p className="mt-4 font-mono text-xs uppercase tracking-wider text-[#c5ced3]">Exécution distante non configurée</p>
              <p className="mt-2 max-w-xs text-xs leading-5 text-muted">Utilisez l’éditeur pour composer votre solution. L’exécution de ce langage sera branchée sur un bac à sable dédié.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
