import { useState } from 'react';
import BottomNav from './components/BottomNav';
import SavePage from './pages/SavePage';
import SearchPage from './pages/SearchPage';
import CollectionsPage from './pages/CollectionsPage';

export default function App() {
  const [page, setPage] = useState('save');

  return (
    <div className="flex flex-col h-full bg-lavender-50">
      <main className="flex-1 flex flex-col overflow-hidden">
        {page === 'save'        && <SavePage />}
        {page === 'search'      && <SearchPage />}
        {page === 'collections' && <CollectionsPage />}
      </main>
      <BottomNav active={page} onChange={setPage} />
    </div>
  );
}
