import { CheckCircle2, XCircle } from 'lucide-react';

export default function Toast({ message, type = 'success', visible }) {
  if (!visible) return null;

  return (
    <div className={`
      fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2
      px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold
      animate-fade-up transition-all duration-300
      ${type === 'success'
        ? 'bg-teal-400 text-white'
        : 'bg-red-400 text-white'}
    `}>
      {type === 'success'
        ? <CheckCircle2 size={16} />
        : <XCircle size={16} />}
      {message}
    </div>
  );
}
