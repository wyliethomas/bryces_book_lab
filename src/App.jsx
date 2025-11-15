import React, { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import AppLayout from './components/Layout/AppLayout';
import OnboardingModal from './components/Onboarding/OnboardingModal';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const onboardingComplete = await window.electronAPI.settings.get('onboarding_complete');
      setShowOnboarding(!onboardingComplete);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setShowOnboarding(true); // Show onboarding if there's an error
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <AppLayout />
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
    </AppProvider>
  );
}

export default App;
