import React from 'react';
import { useApp } from '../../contexts/AppContext';
import ChapterList from '../Chapters/ChapterList';

const RightSidebar = () => {
  const { selectedBookId, currentView } = useApp();

  // Only show right sidebar when a book is selected and in books view
  if (currentView !== 'books' || !selectedBookId) {
    return null;
  }

  return (
    <div className="w-70 bg-gray-50 border-l border-gray-200 flex flex-col">
      <ChapterList />
    </div>
  );
};

export default RightSidebar;
