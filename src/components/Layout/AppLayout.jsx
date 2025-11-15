import React from 'react';
import { useApp } from '../../contexts/AppContext';
import LeftSidebar from './LeftSidebar';
import CenterPanel from './CenterPanel';
import RightSidebar from './RightSidebar';

const AppLayout = () => {
  const { error, clearError } = useApp();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <LeftSidebar />
      <CenterPanel />
      <RightSidebar />

      {/* Error notification */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-white hover:text-gray-200 font-bold"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
