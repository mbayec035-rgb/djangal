import { useEffect, useState } from 'react';

export default function Typewriter({ words, typingSpeed = 72, deletingSpeed = 38, pause = 1700, className = '' }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!words?.length) return undefined;

    const current = words[wordIndex % words.length];
    let delay = deleting ? deletingSpeed : typingSpeed;

    if (!deleting && text === current) {
      delay = pause;
    } else if (deleting && text === '') {
      delay = 180;
    }

    const timeout = window.setTimeout(() => {
      if (!deleting && text === current) {
        setDeleting(true);
        return;
      }
      if (deleting && text === '') {
        setDeleting(false);
        setWordIndex((index) => (index + 1) % words.length);
        return;
      }

      const nextLength = deleting ? text.length - 1 : text.length + 1;
      setText(current.slice(0, nextLength));
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [deleting, deletingSpeed, pause, text, typingSpeed, wordIndex, words]);

  return (
    <span className={className}>
      {text}
      <span className="terminal-caret" aria-hidden="true" />
    </span>
  );
}
