import { Bookmark, Search, Grid3X3 } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic';

const NAV_ITEMS = [
  { id: 'save',        label: 'Save',       Icon: Bookmark   },
  { id: 'search',      label: 'Search',     Icon: Search     },
  { id: 'collections', label: 'Collection', Icon: Grid3X3    },
];

export default function BottomNav({ active, onChange }) {
  const haptic = useHaptic();

  return (
    <nav className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-lavender-100 dark:border-gray-700 safe-bottom">
      <div className="flex items-stretch">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => {
                haptic.tap();
                onChange(id);
              }}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-150 active:scale-95
                ${isActive ? 'text-lavender-600 dark:text-lavender-300' : 'text-lavender-300 dark:text-gray-600'}
              `}
              aria-label={label}
            >
              <div className={`
                p-2 rounded-xl transition-all duration-150
                ${isActive ? 'bg-lavender-100 dark:bg-gray-700' : ''}
              `}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={`text-[10px] font-semibold ${isActive ? 'text-lavender-600 dark:text-lavender-300' : 'text-lavender-300 dark:text-gray-600'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
