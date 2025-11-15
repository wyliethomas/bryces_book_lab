import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { X } from 'lucide-react';

const BookForm = ({ book = null, onClose, onSuccess }) => {
  const { createBook, updateBook } = useApp();
  const [formData, setFormData] = useState({
    title: book?.title || '',
    description: book?.description || '',
    author: book?.author || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setSubmitting(true);
      setError('');

      console.log('📚 Creating book:', formData);

      let result;
      if (book) {
        result = await updateBook(book.id, formData);
        console.log('✅ Book updated:', result);
      } else {
        result = await createBook(formData);
        console.log('✅ Book created:', result);
      }

      onSuccess?.();
    } catch (err) {
      console.error('❌ Error saving book:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        electronAPIAvailable: !!window.electronAPI,
      });
      setError(err.message || 'Failed to save book. Check console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            {book ? 'Edit Book' : 'New Book'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Enter book title"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="input"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea"
              rows="4"
              placeholder="Brief description of your book"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !formData.title.trim()}
            >
              {submitting ? 'Saving...' : book ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookForm;
