import React, { useState, useEffect } from 'react';
import { Edit3, X, Tag as TagIcon, Plus } from 'lucide-react';

const EditNoteModal = ({ note, topics, onSave, onCancel }) => {
  const [content, setContent] = useState('');
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [creatingTopic, setCreatingTopic] = useState(false);
  const [allTopics, setAllTopics] = useState(topics);

  useEffect(() => {
    if (note) {
      setContent(note.content || '');
      // Parse topic_ids from note (comma-separated string from database)
      if (note.topic_ids) {
        const ids = note.topic_ids.split(',').map(id => parseInt(id));
        setSelectedTopicIds(ids);
      } else {
        setSelectedTopicIds([]);
      }
    }
  }, [note]);

  useEffect(() => {
    setAllTopics(topics);
  }, [topics]);

  const handleToggleTopic = (topicId) => {
    if (selectedTopicIds.includes(topicId)) {
      setSelectedTopicIds(selectedTopicIds.filter(id => id !== topicId));
    } else {
      setSelectedTopicIds([...selectedTopicIds, topicId]);
    }
  };

  const handleCreateTopic = async () => {
    const trimmedName = newTopicName.trim();

    if (!trimmedName) {
      alert('Topic name cannot be empty');
      return;
    }

    try {
      setCreatingTopic(true);

      // Create the new topic
      const newTopic = await window.electronAPI.topics.create(trimmedName);

      // Add to local topics list
      setAllTopics([...allTopics, { ...newTopic, note_count: 0 }]);

      // Automatically select the new topic
      setSelectedTopicIds([...selectedTopicIds, newTopic.id]);

      // Clear input
      setNewTopicName('');

    } catch (error) {
      console.error('Error creating topic:', error);
      alert('Error creating topic: ' + error.message);
    } finally {
      setCreatingTopic(false);
    }
  };

  const handleTopicInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateTopic();
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      alert('Note content cannot be empty');
      return;
    }

    try {
      setSaving(true);

      // Update note content
      await window.electronAPI.notes.update(note.id, content);

      // Get original topic IDs
      const originalTopicIds = note.topic_ids
        ? note.topic_ids.split(',').map(id => parseInt(id))
        : [];

      // Find topics to add and remove
      const topicsToAdd = selectedTopicIds.filter(id => !originalTopicIds.includes(id));
      const topicsToRemove = originalTopicIds.filter(id => !selectedTopicIds.includes(id));

      // Add new topic associations
      for (const topicId of topicsToAdd) {
        await window.electronAPI.notes.linkTopic(note.id, topicId);
      }

      // Remove unselected topic associations
      for (const topicId of topicsToRemove) {
        await window.electronAPI.notes.unlinkTopic(note.id, topicId);
      }

      onSave();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error saving note: ' + error.message);
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    // Allow Escape to close modal
    if (e.key === 'Escape') {
      onCancel();
    }
    // Prevent Enter from creating new lines in textarea (optional)
    // Users can use Shift+Enter for new lines
  };

  if (!note) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Edit3 size={24} className="text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Edit Note</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Close"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Note Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="textarea w-full"
              rows="6"
              placeholder="Enter note content..."
              disabled={saving}
              autoFocus
            />
          </div>

          {/* Topics Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <TagIcon size={16} />
                Topics ({selectedTopicIds.length} selected)
              </div>
            </label>

            {allTopics.length === 0 ? (
              <p className="text-sm text-gray-500 italic mb-4">
                No topics available. Create your first topic below.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2 mb-4">
                {allTopics.map((topic) => (
                  <label
                    key={topic.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTopicIds.includes(topic.id)}
                      onChange={() => handleToggleTopic(topic.id)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      disabled={saving || creatingTopic}
                    />
                    <span className="flex-1 text-sm text-gray-700">
                      {topic.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {topic.note_count} {topic.note_count === 1 ? 'note' : 'notes'}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* Create New Topic */}
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Topic
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  onKeyDown={handleTopicInputKeyDown}
                  placeholder="Enter topic name..."
                  className="input flex-1"
                  disabled={saving || creatingTopic}
                />
                <button
                  onClick={handleCreateTopic}
                  className="btn btn-primary flex items-center gap-2 px-4"
                  disabled={saving || creatingTopic || !newTopicName.trim()}
                >
                  <Plus size={16} />
                  {creatingTopic ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={saving || !content.trim()}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditNoteModal;
