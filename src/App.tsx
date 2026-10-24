import React, { useEffect, useState } from 'react';
import { mockAuth, User } from './lib/mockStore';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import BackgroundAnimation from './components/BackgroundAnimation';
import { Loader2 } from 'lucide-react';
import { useSettings } from './contexts/SettingsContext';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useSettings();

  useEffect(() => {
    // Initial check
    setUser(mockAuth.getCurrentUser());
    setLoading(false);

    // Subscribe to mock auth changes
    const unsubscribe = mockAuth.onAuthStateChange((newUser: User | null) => {
      setUser(newUser);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen overflow-hidden font-sans text-slate-900 dark:text-slate-100 bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
      <BackgroundAnimation />
      {user ? <Dashboard /> : <LoginPage />}
    </div>
  );
}
