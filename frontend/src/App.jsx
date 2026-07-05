import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';

export default function App() {
  // If this is null, show Dashboard. If it has an ID, show the Quiz!
  const [activeBankId, setActiveBankId] = useState(null);

  return (
    <>
      {activeBankId ? (
        <Quiz bankId={activeBankId} onBack={() => setActiveBankId(null)} />
      ) : (
        <Dashboard onSelectBank={(id) => setActiveBankId(id)} />
      )}
    </>
  );
}