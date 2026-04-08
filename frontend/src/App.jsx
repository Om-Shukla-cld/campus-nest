import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import StudentDashboard from './components/StudentDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import ModeratorDashboard from './components/ModeratorDashboard';
import GuestDashboard from './components/GuestDashboard';
import AboutMeModal from './components/AboutMeModal';
import './index.css';

function App() {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [showAboutMe, setShowAboutMe] = useState(false);

  // Restore session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('campusnest_user');
    const savedToken = localStorage.getItem('campusnest_token');
    if (savedUser && savedToken) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setRole(parsed.role);
        if (parsed.role === 'student' && !parsed.profileComplete) {
          setTimeout(() => setShowAboutMe(true), 800);
        }
      } catch {}
    }
  }, []);

  const handleLogin = (selectedRole, userData) => {
    setRole(selectedRole);
    setUser(userData);
    // Persist session
    localStorage.setItem('campusnest_user', JSON.stringify({ ...userData, role: selectedRole }));
    if (selectedRole === 'student' && !userData?.profileComplete) {
      setTimeout(() => setShowAboutMe(true), 1000);
    }
  };

  const logout = () => {
    setRole(null);
    setUser(null);
    setShowAboutMe(false);
    localStorage.removeItem('campusnest_token');
    localStorage.removeItem('campusnest_user');
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 selection:bg-amber-200">
      {!role && <LandingPage onLogin={handleLogin} />}
      {role === 'student' && <StudentDashboard user={user} onLogout={logout} />}
      {role === 'owner' && <OwnerDashboard user={user} onLogout={logout} />}
      {role === 'moderator' && <ModeratorDashboard onLogout={logout} />}
      {role === 'guest' && <GuestDashboard onLogout={logout} />}

      {showAboutMe && (
        <AboutMeModal
          onComplete={(profileData) => {
            const updated = { ...user, profileComplete: true, preferences: profileData };
            setUser(updated);
            localStorage.setItem('campusnest_user', JSON.stringify({ ...updated, role }));
            setShowAboutMe(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
