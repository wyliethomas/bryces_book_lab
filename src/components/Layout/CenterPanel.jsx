import React from 'react';
import { useApp } from '../../contexts/AppContext';
import ChapterEditor from '../Editor/ChapterEditor';
import BookView from '../Books/BookView';
import NotesView from '../Notes/NotesView';
import TopicsView from '../Topics/TopicsView';
import SettingsView from '../Settings/SettingsView';
import { BookOpen } from 'lucide-react';

const CenterPanel = () => {
  const { selectedBookId, selectedChapterId, currentView } = useApp();

  // Render different views based on current view and selections
  const renderContent = () => {
    // Settings view
    if (currentView === 'settings') {
      return <SettingsView />;
    }

    // Notes view
    if (currentView === 'notes') {
      return <NotesView />;
    }

    // Topics view
    if (currentView === 'topics') {
      return <TopicsView />;
    }

    // Books view
    if (currentView === 'books') {
      // Chapter editor
      if (selectedChapterId) {
        return <ChapterEditor />;
      }

      // Book view (no chapter selected)
      if (selectedBookId) {
        return <BookView />;
      }

      // Welcome view (no book selected)
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to Book Writing Assistant
            </h2>
            <p className="text-gray-600 mb-6">
              Get started by creating your first book or uploading your notes
              to begin organizing your ideas with AI assistance.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>✍️ Write books with AI-powered assistance</p>
              <p>📝 Organize notes by topics</p>
              <p>📚 Generate outlines and chapters</p>
              <p>📄 Export as professional PDFs</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {renderContent()}
    </div>
  );
};

export default CenterPanel;
