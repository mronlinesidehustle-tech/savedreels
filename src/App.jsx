import { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import SavePage from './pages/SavePage';
import SearchPage from './pages/SearchPage';
import CollectionsPage from './pages/CollectionsPage';
import { getVideoCount } from './utils/storageManager';
import { useTheme } from './hooks/useTheme';

const NUDGE_KEY   = 'sr_last_nudge_scheduled';
const WEEK_MS     = 7 * 24 * 60 * 60 * 1000;

async function scheduleWeeklyNudge() {
  if (!('Notification' in window) || !navigator.serviceWorker) return;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const lastScheduled = parseInt(localStorage.getItem(NUDGE_KEY) || '0', 10);
  const now = Date.now();

  // Only schedule once per week
  if (now - lastScheduled < WEEK_MS) return;

  const count = await getVideoCount();
  if (count === 0) return;

  const reg = await navigator.serviceWorker.ready;
  reg.active?.postMessage({ type: 'SCHEDULE_WEEKLY_NUDGE', videoCount: count });
  localStorage.setItem(NUDGE_KEY, String(now));
}

export default function App() {
  const [page, setPage] = useState('save');
  const { isDark, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    // Schedule nudge after a short delay so app feels snappy on open
    const timer = setTimeout(scheduleWeeklyNudge, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-lavender-50 dark:bg-gray-900 transition-colors duration-200">
      <main className="flex-1 flex flex-col overflow-hidden">
        {page === 'save'        && <SavePage isDark={isDark} toggleTheme={toggleTheme} />}
        {page === 'search'      && <SearchPage />}
        {page === 'collections' && <CollectionsPage />}
      </main>
      <BottomNav active={page} onChange={setPage} />
    </div>
  );
}
