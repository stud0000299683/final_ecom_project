import React, { useState, useEffect } from 'react';
import { getCurrentUser, getUserProfile } from '../services/auth';

const Profile = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = getCurrentUser()?.access_token;
      if (token) {
        try {
          const data = await getUserProfile(token);
          setUserData(data);
        } catch (error) {
          console.error('Профиль не смогли отобразить:', error);
        }
      }
    };

    fetchUserProfile();
  }, []);

  if (!userData) return <div>Loading...</div>;

  return (
    <div>
      <h1>Profile</h1>
      <p>Username: {userData.username}</p>
      <p>Email: {userData.email}</p>
      <p>First Name: {userData.first_name}</p>
      <p>Last Name: {userData.last_name}</p>
    </div>
  );
};

export default Profile;