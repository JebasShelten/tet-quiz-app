import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import Auth from './components/Auth';

export default function App() {
  const [session, setSession] = useState(null);
  const [activeBankId, setActiveBankId] = useState(null);

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // If no one is logged in, show the Auth screen
  if (!session) {
    return <Auth />;
  }

  // If logged in, show the main app
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