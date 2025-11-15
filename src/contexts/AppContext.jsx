import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentView, setCurrentView] = useState('books'); // 'books', 'notes', 'topics', 'settings'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load books on mount
  useEffect(() => {
    loadBooks();
  }, []);

  // Load chapters when book is selected
  useEffect(() => {
    if (selectedBookId) {
      loadChapters(selectedBookId);
    } else {
      setChapters([]);
      setSelectedChapterId(null);
    }
  }, [selectedBookId]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.books.getAll();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async (bookId) => {
    try {
      setLoading(true);
      const data = await window.electronAPI.chapters.getByBookId(bookId);
      setChapters(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createBook = async (bookData) => {
    try {
      setLoading(true);

      // Check if Electron API is available
      if (!window.electronAPI) {
        throw new Error('Electron API not available. App not loaded correctly.');
      }

      console.log('📤 Calling Electron API to create book...');
      const newBook = await window.electronAPI.books.create(bookData);
      console.log('📥 Received from Electron:', newBook);

      setBooks([newBook, ...books]);
      setSelectedBookId(newBook.id);
      setCurrentView('books');
      return newBook;
    } catch (err) {
      console.error('❌ AppContext.createBook error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBook = async (id, bookData) => {
    try {
      setLoading(true);
      const updatedBook = await window.electronAPI.books.update(id, bookData);
      setBooks(books.map(b => b.id === id ? updatedBook : b));
      return updatedBook;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (id) => {
    try {
      setLoading(true);
      await window.electronAPI.books.delete(id);
      setBooks(books.filter(b => b.id !== id));
      if (selectedBookId === id) {
        setSelectedBookId(null);
        setSelectedChapterId(null);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createChapter = async (chapterData) => {
    try {
      setLoading(true);
      const newChapter = await window.electronAPI.chapters.create(chapterData);
      setChapters([...chapters, newChapter].sort((a, b) => a.chapter_number - b.chapter_number));
      setSelectedChapterId(newChapter.id);
      await loadBooks(); // Refresh book stats
      return newChapter;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateChapter = async (id, chapterData) => {
    try {
      const updatedChapter = await window.electronAPI.chapters.update(id, chapterData);
      setChapters(chapters.map(c => c.id === id ? updatedChapter : c));
      await loadBooks(); // Refresh book stats
      return updatedChapter;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteChapter = async (id) => {
    try {
      setLoading(true);
      await window.electronAPI.chapters.delete(id);
      setChapters(chapters.filter(c => c.id !== id));
      if (selectedChapterId === id) {
        setSelectedChapterId(null);
      }
      await loadBooks(); // Refresh book stats
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reorderChapters = async (bookId, chapterIds) => {
    try {
      const reorderedChapters = await window.electronAPI.chapters.reorder(bookId, chapterIds);
      setChapters(reorderedChapters);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const selectBook = (bookId) => {
    setSelectedBookId(bookId);
    setSelectedChapterId(null);
    setCurrentView('books');
  };

  const selectChapter = (chapterId) => {
    setSelectedChapterId(chapterId);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    books,
    selectedBookId,
    selectedChapterId,
    chapters,
    currentView,
    loading,
    error,
    setCurrentView,
    loadBooks,
    loadChapters,
    createBook,
    updateBook,
    deleteBook,
    createChapter,
    updateChapter,
    deleteChapter,
    reorderChapters,
    selectBook,
    selectChapter,
    clearError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
