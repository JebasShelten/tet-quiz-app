import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import Bookmarks from './components/Bookmarks';
import SettingsPage from './components/Settings';

const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
    <h2 className="text-3xl font-bold text-gray-300 mb-2">{title}</h2>
    <p className="text-gray-400 font-medium text-sm">Analytics engine configuration coming up next!</p>
  </div>
);

export default function App() {
  const [session, setSession] = useState(null);
  const [currentView, setCurrentView] = useState('home'); 
  const [activeBankId, setActiveBankId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (!session) return <Auth />;

  const startQuiz = (bankId) => {
    setActiveBankId(bankId);
    setCurrentView('quiz');
  };

  const closeQuiz = () => {
    setActiveBankId(null);
    setCurrentView('home');
  };

  const renderContent = () => {
    if (currentView === 'quiz' && activeBankId) {
      return <Quiz bankId={activeBankId} onBack={closeQuiz} />;
    }
    
    switch (currentView) {
      case 'home': return <Dashboard onSelectBank={startQuiz} />;
      case 'bookmarks': return <Bookmarks />;
      case 'settings': return <SettingsPage />;
      case 'quizzes': return <Placeholder title="My Quizzes Dashboard" />;
      case 'performance': return <Placeholder title="Performance Analytics" />;
      case 'history': return <Placeholder title="Quiz Attempt History" />;
      default: return <Dashboard onSelectBank={startQuiz} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}