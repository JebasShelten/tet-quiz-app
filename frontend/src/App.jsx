import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';

export default function App() {
  const [selectedBankId, setSelectedBankId] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-10 tracking-tight">
        TET Exam Prep Platform
      </h1>
      
      {selectedBankId ? (
        <Quiz bankId={selectedBankId} goBack={() => setSelectedBankId(null)} />
      ) : (
        <Dashboard onSelectBank={(id) => setSelectedBankId(id)} />
      )}
    </div>
  )
}