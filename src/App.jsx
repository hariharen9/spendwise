import React, { useState, useEffect, useCallback } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { db } from './firebaseConfig'; // Import db
import { collection, getDocs, addDoc, doc, setDoc, query, where, serverTimestamp } from 'firebase/firestore';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import './styles/Dashboard.css';
import './styles/Login.css';
import './App.css';

const DEFAULT_PROFILE_NAME = 'Primary Account';
const DEFAULT_COLLECTION_NAME = 'expenses'; // For existing users

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // For "Loading Application..." screen
  const [userProfiles, setUserProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [profilesLoading, setProfilesLoading] = useState(true); // For "Loading User Profiles..." screen
  const auth = getAuth();

  const fetchUserProfiles = useCallback(async (currentUser) => {
    if (!currentUser) {
      // This case should ideally be handled by the caller (onAuthStateChanged)
      // but as a safeguard:
      setUserProfiles([]);
      setActiveProfile(null);
      setProfilesLoading(false);
      return;
    }
    // setProfilesLoading(true); // Caller will set this before awaiting
    try {
      const profilesCollectionRef = collection(db, 'users', currentUser.uid, 'userProfiles');
      const q = query(profilesCollectionRef);
      const querySnapshot = await getDocs(q);
      let profiles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const primaryProfileExists = profiles.some(p => p.collectionName === DEFAULT_COLLECTION_NAME);
      if (!primaryProfileExists) {
        const defaultProfileData = {
          profileName: DEFAULT_PROFILE_NAME,
          collectionName: DEFAULT_COLLECTION_NAME,
          isDefault: true,
          createdAt: serverTimestamp()
        };
        const primaryProfileRef = doc(profilesCollectionRef, DEFAULT_COLLECTION_NAME);
        await setDoc(primaryProfileRef, defaultProfileData, { merge: true });
        // Ensure the newly added default profile is part of the profiles array immediately
        profiles = [defaultProfileData, ...profiles.filter(p => p.collectionName !== DEFAULT_COLLECTION_NAME)];
      }
      
      setUserProfiles(profiles);
      const defaultOrFirstProfile = profiles.find(p => p.isDefault) || profiles[0];
      setActiveProfile(defaultOrFirstProfile);

    } catch (error) {
      console.error('Error fetching user profiles:', error);
      const fallbackProfile = { profileName: DEFAULT_PROFILE_NAME, collectionName: DEFAULT_COLLECTION_NAME, isDefault: true, id: DEFAULT_COLLECTION_NAME };
      setUserProfiles([fallbackProfile]);
      setActiveProfile(fallbackProfile);
    } finally {
      setProfilesLoading(false); // Crucial: always set to false after attempt
    }
  }, []); // Dependencies: db, DEFAULT_PROFILE_NAME, DEFAULT_COLLECTION_NAME, serverTimestamp are stable

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setProfilesLoading(true); // Indicate profiles are about to be loaded
        await fetchUserProfiles(currentUser); // This will set profilesLoading to false in its finally block
        // After profiles are fetched (or fallback), activeProfile should be set.
        setLoading(false); // App is no longer in the initial "Loading Application..." state
      } else {
        // No user / User logged out
        setUserProfiles([]);
        setActiveProfile(null);
        setProfilesLoading(false); // Ensure this is false
        setLoading(false);       // App is no longer in the initial "Loading Application..." state
      }
    });

    return () => unsubscribe();
  }, [auth, fetchUserProfiles]); // fetchUserProfiles is stable due to useCallback([])

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfiles([]);
      setActiveProfile(null);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const handleAddProfile = async (profileName) => {
    if (!user || !profileName.trim()) return;
    const newCollectionName = `expenses_${profileName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    const newProfileData = {
      profileName: profileName.trim(),
      collectionName: newCollectionName,
      isDefault: false,
      createdAt: serverTimestamp()
    };
    try {
      const profilesCollectionRef = collection(db, 'users', user.uid, 'userProfiles');
      const docRef = await addDoc(profilesCollectionRef, newProfileData);
      const newProfile = { id: docRef.id, ...newProfileData };
      setUserProfiles(prevProfiles => [...prevProfiles, newProfile]);
      setActiveProfile(newProfile); // Optionally switch to the new profile
      alert(`Account '${profileName}' created successfully!`);
    } catch (error) {
      console.error('Error adding new profile:', error);
      alert('Failed to create new account. Please try again.');
    }
  };

  if (loading) {
    return <div className="app-loading">Loading Application...</div>;
  }

  return (
    <div className="App">
      {user && activeProfile ? (
        <Dashboard 
          currentUser={user} 
          onLogout={handleLogout} 
          userProfiles={userProfiles}
          activeProfile={activeProfile}
          setActiveProfile={setActiveProfile}
          onAddProfile={handleAddProfile}
        />
      ) : user && profilesLoading ? (
        <div className="app-loading">Loading User Profiles...</div>
      ) : (
        <Login setUser={setUser} />
      )}
    </div>
  );
}

export default App;
