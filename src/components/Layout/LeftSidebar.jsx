import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { BookOpen, FileText, Tag, Settings, Plus } from 'lucide-react';
import BookForm from '../Books/BookForm';

const LeftSidebar = () => {
  const { books, selectedBookId, currentView, selectBook, setCurrentView } = useApp();
  const [showBookForm, setShowBookForm] = useState(false);

  const handleNewBook = () => {
    setShowBookForm(true);
  };

  const handleBookCreated = () => {
    setShowBookForm(false);
  };

  return (
    <div className="w-60 bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-lg font-bold">Bryce's Book Lab</h1>
      </div>

      {/* Books Section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Books
            </h2>
            <button
              onClick={handleNewBook}
              className="p-1 hover:bg-gray-800 rounded transition-colors"
              title="New Book"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-1">
            {books.map((book) => (
              <button
                key={book.id}
                onClick={() => selectBook(book.id)}
                className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors ${
                  selectedBookId === book.id && currentView === 'books'
                    ? 'bg-primary-600 text-white'
                    : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                <BookOpen size={16} className="flex-shrink-0" />
                <span className="truncate text-sm">{book.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-2"></div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1">
          <button
            onClick={() => setCurrentView('notes')}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors ${
              currentView === 'notes'
                ? 'bg-primary-600 text-white'
                : 'hover:bg-gray-800 text-gray-300'
            }`}
          >
            <FileText size={16} />
            <span className="text-sm">All Notes</span>
          </button>

          <button
            onClick={() => setCurrentView('topics')}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors ${
              currentView === 'topics'
                ? 'bg-primary-600 text-white'
                : 'hover:bg-gray-800 text-gray-300'
            }`}
          >
            <Tag size={16} />
            <span className="text-sm">Topics Catalog</span>
          </button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={() => setCurrentView('settings')}
          className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors ${
            currentView === 'settings'
              ? 'bg-primary-600 text-white'
              : 'hover:bg-gray-800 text-gray-300'
          }`}
        >
          <Settings size={16} />
          <span className="text-sm">Settings</span>
        </button>
      </div>

      {/* Book Form Modal */}
      {showBookForm && (
        <BookForm
          onClose={() => setShowBookForm(false)}
          onSuccess={handleBookCreated}
        />
      )}
    </div>
  );
};

export default LeftSidebar;
