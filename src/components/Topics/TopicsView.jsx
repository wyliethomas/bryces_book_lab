import React, { useState, useEffect } from 'react';
import { Tag, FileText, BookOpen } from 'lucide-react';

const TopicsView = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicNotes, setTopicNotes] = useState([]);

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      loadTopicNotes(selectedTopic.id);
    }
  }, [selectedTopic]);

  const loadTopics = async () => {
    try {
      const data = await window.electronAPI.topics.getAll();
      setTopics(data);
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  };

  const loadTopicNotes = async (topicId) => {
    try {
      const data = await window.electronAPI.topics.getNotesByTopic(topicId);
      setTopicNotes(data);
    } catch (error) {
      console.error('Error loading topic notes:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-900">Topics Catalog</h2>
        <p className="text-gray-600 mt-1">
          Browse topics extracted from your notes
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-4xl mx-auto">
          {topics.length === 0 ? (
            <div className="card text-center py-12">
              <Tag size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No Topics Yet
              </h3>
              <p className="text-gray-600">
                Add some notes to automatically extract topics
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Topics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic)}
                    className={`card text-left transition-all hover:shadow-md ${
                      selectedTopic?.id === topic.id
                        ? 'ring-2 ring-primary-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary-100 rounded">
                        <Tag size={20} className="text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {topic.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {topic.note_count} {topic.note_count === 1 ? 'note' : 'notes'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Topic Details */}
              {selectedTopic && (
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">
                      {selectedTopic.name}
                    </h3>
                    <button
                      onClick={() => setSelectedTopic(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 flex items-center gap-2">
                      <FileText size={16} />
                      Related Notes ({topicNotes.length})
                    </h4>

                    {topicNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-gray-50 rounded p-3 text-sm"
                      >
                        <p className="text-gray-800">{note.content}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(note.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">
                      Create a new chapter using notes from this topic
                    </p>
                    <button className="btn btn-primary flex items-center gap-2">
                      <BookOpen size={16} />
                      Create Chapter from Topic
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicsView;
