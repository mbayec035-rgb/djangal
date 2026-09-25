import {
  Braces,
  Code2,
  Coffee,
  FileCode2,
  Github,
  GitBranch,
  Network,
  Palette,
  Terminal,
  Workflow,
} from 'lucide-react';

const icons = {
  'code-2': Code2,
  'code2': Code2,
  palette: Palette,
  braces: Braces,
  coffee: Coffee,
  'file-code-2': FileCode2,
  filecode2: FileCode2,
  terminal: Terminal,
  network: Network,
  workflow: Workflow,
  'git-branch': GitBranch,
  gitbranch: GitBranch,
  github: Github,
};

export default function CourseIcon({ name, size = 22, className = '' }) {
  const Icon = icons[String(name).toLowerCase()] || Code2;
  return <Icon size={size} className={className} strokeWidth={1.7} />;
}
