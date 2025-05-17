import React, { useState } from 'react';
import '../styles/ProfileManager.css'; // We'll create this CSS file next

const ProfileManager = ({ userProfiles, activeProfile, setActiveProfile, onAddProfile }) => {
  const [newProfileName, setNewProfileName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const handleProfileChange = (event) => {
    const profileId = event.target.value;
    const selectedProfile = userProfiles.find(p => p.id === profileId || p.collectionName === profileId);
    if (selectedProfile) {
      setActiveProfile(selectedProfile);
    }
  };

  const handleAddNewProfile = () => {
    if (newProfileName.trim()) {
      onAddProfile(newProfileName.trim());
      setNewProfileName('');
      setShowAddInput(false);
    }
  };

  if (!userProfiles || userProfiles.length === 0) {
    return <div className="profile-manager-empty">No profiles available.</div>;
  }

  return (
    <div className="profile-manager">
      <label htmlFor="profile-select" className="profile-label">Account:</label>
      <select 
        id="profile-select" 
        value={activeProfile?.id || activeProfile?.collectionName} 
        onChange={handleProfileChange}
        className="profile-select"
      >
        {userProfiles.map(profile => (
          <option key={profile.id || profile.collectionName} value={profile.id || profile.collectionName}>
            {profile.profileName}
          </option>
        ))}
      </select>
      <button 
        onClick={() => setShowAddInput(!showAddInput)} 
        className={`add-profile-toggle-button ${showAddInput ? 'cancel-active' : ''}`}
      >
        {showAddInput ? 'Cancel' : '+'}
      </button>
      {showAddInput && (
        <div className="add-profile-input-container">
          <input 
            type="text" 
            value={newProfileName} 
            onChange={(e) => setNewProfileName(e.target.value)} 
            placeholder="New account name"
            className="add-profile-input"
          />
          <button onClick={handleAddNewProfile} className="add-profile-submit-button">Add</button>
        </div>
      )}
    </div>
  );
};

export default ProfileManager;