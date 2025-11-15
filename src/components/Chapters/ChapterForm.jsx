import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { X, Sparkles } from 'lucide-react';

const ChapterForm = ({ bookId, onClose, onSuccess }) => {
  const { createChapter } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
  });
  const [topics, setTopics] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const data = await window.electronAPI.topics.getAll();
      setTopics(data);
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setSubmitting(true);

      // If a topic is selected, generate an outline
      let outline = null;
      if (formData.topic) {
        setGenerating(true);
        const topic = topics.find((t) => t.id === parseInt(formData.topic));
        if (topic) {
          const notes = await window.electronAPI.topics.getNotesByTopic(topic.id);
          outline = await window.electronAPI.ai.generateOutline(
            topic.name,
            notes
          );
        }
        setGenerating(false);
      }

      await createChapter({
        book_id: bookId,
        title: formData.title,
        outline: outline,
        status: outline ? 'outline' : 'draft',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error creating chapter:', error);
      setGenerating(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">New Chapter</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={submitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chapter Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Enter chapter title"
              required
              autoFocus
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic (Optional)
            </label>
            <select
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              className="input"
              disabled={submitting}
            >
              <option value="">Select a topic...</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name} ({topic.note_count} notes)
                </option>
              ))}
            </select>
            {formData.topic && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Sparkles size={12} />
                AI will generate an outline from related notes
              </p>
            )}
          </div>

          {generating && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
              <Sparkles size={16} className="inline mr-2" />
              Generating outline from notes...
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
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
              {submitting ? 'Creating...' : 'Create Chapter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChapterForm;
