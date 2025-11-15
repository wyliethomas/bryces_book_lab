import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Edit2, Trash2, Plus } from 'lucide-react';
import BookForm from './BookForm';
import ChapterForm from '../Chapters/ChapterForm';

const BookView = () => {
  const { books, selectedBookId, chapters, deleteBook } = useApp();
  const [book, setBook] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const currentBook = books.find((b) => b.id === selectedBookId);
    setBook(currentBook);
  }, [books, selectedBookId]);

  if (!book) return null;

  const handleDelete = async () => {
    try {
      await deleteBook(book.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
      <div className="max-w-4xl mx-auto">
        {/* Book Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {book.title}
              </h1>
              {book.author && (
                <p className="text-lg text-gray-600">by {book.author}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditForm(true)}
                className="btn btn-secondary btn-sm flex items-center gap-2"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn btn-danger btn-sm flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>

          {book.description && (
            <p className="text-gray-700 leading-relaxed">{book.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card">
            <div className="text-3xl font-bold text-primary-600">
              {book.chapter_count || 0}
            </div>
            <div className="text-sm text-gray-600">Chapters</div>
          </div>
          <div className="card">
            <div className="text-3xl font-bold text-primary-600">
              {book.word_count?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600">Words</div>
          </div>
        </div>

        {/* Call to Action */}
        {chapters.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Ready to Start Writing?
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first chapter to begin your book
            </p>
            <button
              onClick={() => setShowChapterForm(true)}
              className="btn btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Create First Chapter
            </button>
          </div>
        ) : (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Activity
            </h3>
            <p className="text-gray-600">
              Select a chapter from the right sidebar to continue writing, or
              create a new chapter to expand your book.
            </p>
          </div>
        )}
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <BookForm
          book={book}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => setShowEditForm(false)}
        />
      )}

      {/* Chapter Form Modal */}
      {showChapterForm && (
        <ChapterForm
          bookId={book.id}
          onClose={() => setShowChapterForm(false)}
          onSuccess={() => setShowChapterForm(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Delete Book?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{book.title}"? This will also
              delete all chapters. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                Delete Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookView;
