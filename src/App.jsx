import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import Dashboard from './components/Dashboard';
import Login from './components/Login'; // Import the Login component
import './styles/Dashboard.css'; // Global styles for the dashboard
import './styles/Login.css'; // Import Login component styles
import './App.css'; // Keep or remove if Dashboard.css covers everything

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear user state
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  if (loading) {
    // Optional: Add a more sophisticated loading screen later
    return <div className="app-loading">Loading Application...</div>;
  }

  return (
    <div className="App">
      {user ? (
        <>
          {/* Pass user and handleLogout to Dashboard if needed */}
          {/* e.g., <Dashboard user={user} onLogout={handleLogout} /> */}
          <Dashboard currentUser={user} onLogout={handleLogout} />
        </>
      ) : (
        <Login setUser={setUser} />
      )}
    </div>
  );
}

export default App;
