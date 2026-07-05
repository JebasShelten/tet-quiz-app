import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';

// Quick Placeholders for the new pages we will build next
const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
    <h2 className="text-3xl font-bold text-gray-400 mb-2">{title}</h2>
    <p className="text-gray-500">This page is coming soon!</p>
  </div>
);

export default function App() {
  const [session, setSession] = useState(null);
  
  // NEW: The Master Router State
  const [currentView, setCurrentView] = useState('home'); 
  const [activeBankId, setActiveBankId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (!session) return <Auth />;

  // Navigation Handlers
  const startQuiz = (bankId) => {
    setActiveBankId(bankId);
    setCurrentView('quiz');
  };

  const closeQuiz = () => {
    setActiveBankId(null);
    setCurrentView('home');
  };

  // Decide which page to show inside the Layout
  const renderContent = () => {
    if (currentView === 'quiz' && activeBankId) {
      return <Quiz bankId={activeBankId} onBack={closeQuiz} />;
    }
    
    switch (currentView) {
      case 'home': return <Dashboard onSelectBank={startQuiz} />;
      case 'quizzes': return <Placeholder title="My Quizzes" />;
      case 'bookmarks': return <Placeholder title="Bookmarks" />;
      case 'performance': return <Placeholder title="Performance" />;
      case 'history': return <Placeholder title="History" />;
      case 'settings': return <Placeholder title="Settings" />;
      default: return <Dashboard onSelectBank={startQuiz} />;
    }
  };

  return (
    // We put Layout OUTSIDE the pages so it never resets when you switch pages!
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}