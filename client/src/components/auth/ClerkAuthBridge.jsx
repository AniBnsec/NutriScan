import { useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import useStore from '../../store/useStore';
import { setClerkTokenGetter } from '../../api/client';

export default function ClerkAuthBridge() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const setStoreState = useStore.setState;
  const prevUserIdRef = useRef(null);

  // Register Clerk token getter with the API client immediately
  useEffect(() => {
    setClerkTokenGetter(getToken);
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      const incomingId = user.id;
      const prevId = prevUserIdRef.current;

      // If a different user is signing in, wipe all previous user data first
      if (prevId && prevId !== incomingId) {
        localStorage.clear();
        setStoreState({
          user: null,
          token: null,
          isAuthenticated: false,
          todayData: null,
          meals: [],
          weeklyData: null,
          stats: null,
          scanResult: null,
        });
      }

      prevUserIdRef.current = incomingId;

      const userData = {
        id: user.id,
        _id: user.id,
        name: user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User',
        email: user.primaryEmailAddress?.emailAddress || 'user@example.com',
        imageUrl: user.imageUrl,
        weight: user.unsafeMetadata?.weight || 70,
        height: user.unsafeMetadata?.height || 175,
        calorieGoal: user.unsafeMetadata?.calorieGoal || 2200,
        dietMode: user.unsafeMetadata?.dietMode || 'balanced',
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('nutriscan_uid', incomingId);

      setStoreState({
        user: userData,
        isAuthenticated: true,
      });
    } else if (!isSignedIn) {
      prevUserIdRef.current = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('nutriscan_uid');
      setStoreState({
        token: null,
        user: null,
        isAuthenticated: false,
        todayData: null,
        meals: [],
        weeklyData: null,
        stats: null,
        scanResult: null,
      });
    }
  }, [isLoaded, isSignedIn, user, setStoreState]);

  return null;
}

